
import {
    apiHost
} from '../../constants';

import {
    HttpHeaders
} from '@angular/common/http';

interface QueryParams {
    where?: any;
    count?: number;
    include?: string;
    sort?: string;
    limit?: number;
    skip?: number;
    proj?: any;
}

const WARNING = "WARNING! The `rememberMe` functionality uses Secure Storage, so it is safe to store login and password only in native applications (apk/aab, ipa). In the web version, a placeholder is used exclusively for testing the application. Do not use `rememberMe` in the production version of the web application.";
let warningWasShown = false;
function showWarning($a) {
    if (!warningWasShown) {
      if ($a._rootHelper.isBrowser()) {
        console.warn(WARNING);
      }
      warningWasShown = true;
    }
  }

const HEADER_DATABASE_ID = "X-Appery-Database-Id",
    HEADER_SESSION_TOKEN = "X-Appery-Session-Token";

const SET_USER_ID_ERROR = "User ID is not specified. Set User ID with `userSetId` method",
    NOT_LOGGED_IN_ERROR = "User ID is not specified. Login before update user data";

export var UtilsDB = {

    initDBUtils: function(rootHelper) {
        this._rootHelper = rootHelper;
        this.host = apiHost + "/rest/1/db";
        const databaseId = this._rootHelper.config.get("Settings.databaseId");
        if (databaseId) {
            this.setDatabaseId(databaseId);
        }
    },

    host: "",
    _rootHelper: null,
    _userId: undefined,
    _defaultParams: null,

    headers: {},

    addHeaders: function(headers) {
        this._rootHelper.addHeaders.call(this, headers);
    },

    setHeaders: function(headers) {
        this.headers = headers;
    },

    getHeaders: function(options?: {headers: any, clearContentType?: boolean, noExtend?: boolean}): {headers: HttpHeaders} {
        return this._rootHelper.getHeaders.call(this, options);
    },

    processOptions: function(options) {
        options = {...options};
        options.headers = {...this.headers, ...options.headers};
        return options;
    },

    login: async function(payload: {username: string, password: string, rememberMe?: boolean} = <any>{}, options: any = {}): Promise<any> {
        this.setSessionToken(); // remove current Session Token. Wrong (expired) token leads to login error
        this.userSetId();
        options = this.processOptions(options);
        const session = await this._rootHelper.post(`${this.host}/login`, {
            username: payload.username,
            password: payload.password
        }, {...options, message: undefined});

        if (!session?.sessionToken) return null;

        this.setSessionToken(session.sessionToken);
        this.userSetId(session._id);
        options = this.processOptions(options);

        if (payload.rememberMe) {
            showWarning(this);
            await this._rootHelper.setStorage('rememberMe', payload.rememberMe);
            await this._rootHelper.ssSet('credentials', payload);
        }

        const res = await this._rootHelper.get(`${this.host}/users/${session._id}`, {headers: options.headers});
        if (options.message) await this._rootHelper.toast(options.message);
        return res;
    },

    setSessionToken: function(sessionToken?) {
        if (sessionToken) {
            this.addHeaders({
                [HEADER_SESSION_TOKEN]: sessionToken
            })
        } else {
            delete this.headers[HEADER_SESSION_TOKEN];
        }
    },

    getSessionToken: function(): string|undefined {
        const headers = new HttpHeaders(this.headers);
        return headers.get(HEADER_SESSION_TOKEN) || undefined;
    },

    setDatabaseId: function(databaseId?) {
        if (databaseId) {
            this.addHeaders({
                [HEADER_DATABASE_ID]: databaseId
            });
        } else {
            delete this.headers[HEADER_DATABASE_ID];
        }
    },

    getDatabaseId: function(): string|undefined {
        const headers = new HttpHeaders(this.headers);
        return headers.get(HEADER_DATABASE_ID) || undefined;
    },

    setDefaultParams: function(params: {[key:string]: any}|null|undefined = null): void {
        if (params && _.isObject(params) && !_.isEmpty(params)) {
            this._defaultParams = _.cloneDeep(params);
        } else {
            this._defaultParams = null;
        }
    },
    
    getDefaultParams: function(): {[key:string]: any}|null {
        if (this._defaultParams) {
            return _.cloneDeep(this._defaultParams);
        } else {
            return null;
        }
    },


    clearItem: function(item) {
        delete item._id;
        delete item.acl;
        delete item._createdAt;
        delete item._updatedAt;
    },

    autoLogin: async function(): Promise<any> {
        showWarning(this);
        const rememberMe = await this._rootHelper.getStorage('rememberMe');
        if (rememberMe) {
            const value = await this._rootHelper.ssGet('credentials');
            return value ? await this.login(value) : null;
        }
        return null;
    },

    logout: async function(): Promise<void> {
        this.setSessionToken();
        this.userSetId();
        await this._rootHelper.setStorage('rememberMe', false);
        await this._rootHelper.ssRemove('credentials');
    },

    getById: async function(collection: string, id: string, options: any = {}): Promise<any> {
        options = this.processOptions(options);
        return await this._rootHelper.get(`${this.host}/collections/${collection}/${id}`, options);
    },

    query: async function(collection, params: QueryParams = {}, options: any = {}): Promise<any> {
        options = this.processOptions(options);
        if (this._defaultParams) params = {...this._defaultParams, ...params};
        let cacheKey = collection + "__" + JSON.stringify(params);
        if (options.cache) {
            try {
                let cachedString = window.localStorage.getItem(cacheKey);
                if (cachedString) {
                    let res = JSON.parse(cachedString);
                    return res;
                }
            } catch(e) {}
        }
        let res = await this._rootHelper.post(`${this.host}/collections/${collection}/query`, params, options);
        if (options.cache || options.saveInCache) {
            window.localStorage.setItem(cacheKey, JSON.stringify(res));
        }
        return res;
    },
    
    queryOne: async function(collection, params: QueryParams = {}, options: any = {}): Promise<any> {
        params = {...params, ...{limit: 1}};
        let res = await this.query(collection, params, options);
        return res ? res[0] : undefined;
    },

    save: async function(collection, item, options: any = {}): Promise<any> {
        options = this.processOptions(options);

        if (_.isArray(item)) {
            const payload = item.map(({
                _id,
                ...data
            }) => {
                this.clearItem(data);
                return _id ? 
                    {
                        method: "PUT",
                        collection,
                        _id,
                        data
                    }
                    : {
                        method: "POST",
                        collection,
                        data
                    };
            });
            return await this._rootHelper.post(`${this.host}/batch`, payload, options);
        }

        let data = null;

        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            let saveRes, itemId;
            if (item._id) {
                const {
                    _id,
                    ...payload
                } = item;
                this.clearItem(payload);
                saveRes = await this._rootHelper.put(`${this.host}/collections/${collection}/${_id}`, payload, {
                    ...options,
                    loading: false,
                    message: undefined
                });
                itemId = _id;
            } else {
                saveRes = await this._rootHelper.post(`${this.host}/collections/${collection}`, item, {
                    ...options,
                    loading: false,
                    message: undefined
                });
                itemId = saveRes?._id;
            }

            if (saveRes) {
                data = await this.getById(collection, itemId, {
                    ...options,
                    loading: false,
                    message: undefined
                });
            }

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }

        return data;

    },

    remove: async function(collection, item, options: any = {}): Promise<any> {
        options = this.processOptions(options);
        if (_.isArray(item)) {
            const payload = item.map(({
                _id,
                ...data
            }) => {
                this.clearItem(data);
                return {
                    method: "DELETE",
                    collection,
                    _id
                };
            });
            return await this._rootHelper.post(`${this.host}/batch`, payload, options);
        }
        if (typeof item == 'object') item = item._id;
        return await this._rootHelper.delete(`${this.host}/collections/${collection}/${item}`, options);
    },

    /**
     * delete file if base64Data is null 
     * update file if base64Data is string
     * options.deleteOldFile: boolean
     */
    saveWithFile: async function(collection, item, fileData: {
        base64Data?,
        fileName?,
        filePropName?
    } = {}, options: any = {}): Promise<any> {

        let {
            base64Data,
            fileName,
            filePropName
        } = fileData || {};

        options = this.processOptions(options);

        if (!fileName) {
            fileName = this._rootHelper.DEFAULT_FILE_NAME;
        }
        if (!filePropName) {
            filePropName = "file";
        }

        let file: any = null;
        if (base64Data) {
            file = await this.uploadBase64File(base64Data, fileName, {...options, message: undefined});
            if (!file) return null;
        }

        try {
            let fileNameToDelete = options.deleteOldFile && item[filePropName]?.fileName;

            item[filePropName] = file;

            const updatedItem = await this.save(collection, item, {
                ...options,
                throwError: true,
                message: undefined
            });

            if (fileNameToDelete) {
                await this.deleteFile(fileNameToDelete, {...options, message: undefined});
            }
            if (options.message) await this._rootHelper.toast(options.message);
            return updatedItem;
        } catch (err) {
            if (file) {
                await this.deleteFile(file.fileName, {...options, message: undefined});
            }
            return null;
        }
    },

    removeWithFile: async function(collection, item, filePropName, options: any = {}): Promise<any> {
        options = this.processOptions(options);
        if (item[filePropName]) {
            await this.deleteFile(item[filePropName].fileName, {...options, message: undefined});
        }

        return await this.remove(collection, item, options);
    },

    uploadBase64File: async function(base64Data, fileName = this._rootHelper.DEFAULT_FILE_NAME, options = {}): Promise<{fileName:string, originalFileName:string, fileurl:string}|null> {
        options = this.processOptions(options);
        const file = await this._rootHelper.post(`${this.host}/files/`, {
            _id: fileName,
            content: this._rootHelper.getFileBase64Data(base64Data),
            contentType: this._rootHelper.getMediaTypeFromDataURL(base64Data)
        }, options);
        
        return file ? {
            fileName: file._id,
            originalFileName: fileName,
            fileurl: this.getFileUrl(file._id)
        } : null;
    },

    deleteFile: async function(fileName, options: any = {}): Promise<any> {
        options = this.processOptions(options);
        return await this._rootHelper.delete(`${this.host}/files/${fileName}`, options);
    },

    getFileUrl: function(fileName): string {
        return `${apiHost}/rest/1.1/db/files/${this.getDatabaseId()}/${fileName}`;
    },

    userCreate: async function(userData, options: any = {}): Promise<any> {
        options = this.processOptions(options); 
        let data = null;

        try {
            options = this._rootHelper.getOptions(options);
            if (options.loadingStart) await this._rootHelper.showLoading();

            let saveRes;
            saveRes = await this._rootHelper.post(`${this.host}/users`, userData, {
                ...options,
                loading: false,
                message: undefined
            });
            if (saveRes) {
                this.setSessionToken(saveRes.sessionToken);
                this.userSetId(saveRes._id);
                data = saveRes;
            }

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }

        return data;

    },
    
    userUpdate: async function(userData, options: any = {}): Promise<any> {
        if (!this.userGetId()) {
            if (this.headers[HEADER_SESSION_TOKEN]) {
                await this._rootHelper.errorCatch({message: SET_USER_ID_ERROR}, options);
            } else {
                await this._rootHelper.errorCatch({message: NOT_LOGGED_IN_ERROR}, options);
            }
            return;
        }
        options = this.processOptions(options); 
        let data = null;

        try {
            options = this._rootHelper.getOptions(options);
            if (options.loadingStart) await this._rootHelper.showLoading();

            let saveRes;

            const payload = { ...userData };
            this.clearItem(payload);
            saveRes = await this._rootHelper.put(`${this.host}/users/${this.userGetId()}`, payload, {
                ...options,
                loading: false,
                message: undefined
            });
            if (saveRes) {
                data = saveRes;
            }

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }

        return data;

    },
    
    userGetData: async function(options: any = {}): Promise<any> {
        if (!this.userGetId()) {
            if (this.headers[HEADER_SESSION_TOKEN]) {
                await this._rootHelper.errorCatch({message: SET_USER_ID_ERROR}, options);
            } else {
                await this._rootHelper.errorCatch({message: NOT_LOGGED_IN_ERROR}, options);
            }
            return;
        }
        options = this.processOptions(options);
        return await this._rootHelper.get(`${this.host}/users/me`, options);
    },
    
    userRemove: async function(options: any = {}): Promise<any> {
        if (!this.userGetId()) {
            if (this.headers[HEADER_SESSION_TOKEN]) {
                await this._rootHelper.errorCatch({message: SET_USER_ID_ERROR}, options);
            } else {
                await this._rootHelper.errorCatch({message: NOT_LOGGED_IN_ERROR}, options);
            }
            return;
        }
        options = this.processOptions(options);
        await this._rootHelper.delete(`${this.host}/users/${this.userGetId()}`, options);
        await this.logout();
    },
    
    userGetId: function(): string {
        return this._userId;
    },

    userSetId: function(userId?: string|null|undefined): void {
        this._userId = userId;
    }

};

export interface UtilsDBInterface {
    addHeaders(headers: {[key:string]: string}): void;
    setHeaders(headers: {[key:string]: string}): void;
    getHeaders(options?: {headers: any, clearContentType?: boolean, noExtend?: boolean}): {headers: HttpHeaders};
    login(payload: {username: string, password: string, rememberMe?: boolean} , options?): Promise<any>;
    setSessionToken(sessionToken?: string|null|undefined): void;
    getSessionToken(): string|undefined;
    setDatabaseId(databaseId?: string|null|undefined): void;
    getDatabaseId(): string|undefined;
    setDefaultParams(params?: {[key:string]: any}|null|undefined): void;
    getDefaultParams(): {[key:string]: any}|null;
    clearItem(item): void;
    autoLogin(): Promise<any>;
    logout(): Promise<void>;
    getById(collection: string, id: string, options?): Promise<any>;
    query(collection: string, params?: QueryParams, options?): Promise<any>;
    queryOne(collection: string, params?: QueryParams, options?): Promise<any>;
    save(collection: string, item, options?): Promise<any>;
    remove(collection: string, item, options?): Promise<any>;
    saveWithFile(collection: string, item, fileData?: {base64Data?: string, fileName?: string, filePropName?: string}, options?): Promise<any>;
    removeWithFile(collection: string, item, filePropName: string, options?): Promise<any>;
    uploadBase64File(base64Data: string, fileName?: string, options?): Promise<{fileName:string, originalFileName:string, fileurl:string}|null>;
    deleteFile(fileName: string, options?): Promise<any>;
    getFileUrl(fileName: string): string;
    userCreate(userData, options?): Promise<any>;
    userUpdate(userData, options?): Promise<any>;
    userGetData(options?): Promise<any>;
    userRemove(options?): Promise<any>;
    userGetId(): string;
    userSetId(userId?: string|null|undefined): void;
};
