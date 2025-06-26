interface AexQueryParams {
    where?: any;
    sortBy?: string;
    limit?: number;
}

export var UtilsAppClient = {

    _rootHelper: null,

    state: "",

    initAEXUtils: async function(rootHelper) {
        this._rootHelper = rootHelper;
        const appClientSettings = this._rootHelper.config.get("AppClientSettings");
        if (appClientSettings && appClientSettings.domain && appClientSettings.apiKey) {
            this.addListener("statechange", (newState) => this.state = newState);
            this.state = (await this.getState()).state;
        }
    },

    getEntityById: async function(entity: string, id, options: any = {}) {
        options = this._rootHelper.getOptions({
            ...{
                cached: true
            },
            ...options
        });

        if (!id) return {};

        let obj;
        if (id) {
            try {
                if (!options.cached && options.loadingStart) await this._rootHelper.showLoading();

                obj = await this._rootHelper.appClientGenericWrapperService.read({
                        _id: id,
                        cached: options.cached
                    },
                    {
                    model: entity,
                    primaryKeyName: '_id'
                    }
                );
                if (!options.cached && options.loadingEnd) await this._rootHelper.dismissLoading();
                if (options.message) await this._rootHelper.toast(options.message);

            } catch (e) {
                await this._rootHelper.errorCatch(e, options);
            }
        }

        return obj;
    },

    get: async function(entity: string, id, options: any = {}) {
        if (!id) return;

        let obj: any = await this.getEntityById(entity, id, {...options, ...{showError: !!options.cached}});
        if (obj && obj._id) {
            return obj;
        }

        return options.cached ? undefined : await this.getEntityById(entity, id, {...options, ...{cached: false}});
    },

    _query: async function(entity: string, params: AexQueryParams = {}, options: any = {}) {
        try {
            options = this._rootHelper.getOptions({
                ...{
                    cached: true
                },
                ...options
            });
            params = {
                ...{
                    limit: 2000,
                    where: {}
                },
                ...params
            };

            if (!options.cached && options.loadingStart) await this._rootHelper.showLoading();
            const data: any = {
                where: params.where,
                limit: params.limit,
                cached: options.cached
            };

            if (params.sortBy) data.sortBy = params.sortBy;

            let res = await this._rootHelper.appClientGenericWrapperService.list(data, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (!options.cached && options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
            return res;

        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    query: async function(entity: string, params: AexQueryParams = {}, options: any = {}) {
        let res: any = await this._query(entity, params, {...options, ...{showError: !!options.cached}});
        if (res && res.length) {
            return res;
        }

        return options.cached ? [] : await this._query(entity, params, {...options, ...{cached: false}});
    },
    
    queryOne: async function(entity: string, params: AexQueryParams = {}, options: any = {}) {
        params = {...params, ...{limit: 1}};
        let res = await this.query(entity, params, options);
        return res && res[0] ? res[0] : undefined;
    },
    
    count: async function(entity: string, params: {where?: any} = {}, options: any = {}) {
        try {
            options = this._rootHelper.getOptions({
                ...{
                    cached: true
                },
                ...options
            });
            params = {
                ...{
                    where: {}
                },
                ...params
            };

            if (!options.cached && options.loadingStart) await this._rootHelper.showLoading();
            const data: any = {
                where: params.where,
                cached: options.cached
            };
            let res = await this._rootHelper.appClientGenericWrapperService.count(data, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (!options.cached && options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
            return res;

        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    save: async function(entity: string, obj, options: any = {}) {
        if (obj._id) {
            return await this.updateEntity(entity, obj, options);
        } else {
            return await this.createEntity(entity, obj, options);
        }
    },

    createEntity: async function(entity: string, obj, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            const newObj = await this._rootHelper.appClientGenericWrapperService.post(obj, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return newObj;
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    updateEntity: async function(entity: string, obj, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            delete obj.acl;
            delete obj._createdAt;

            const newObj = await this._rootHelper.appClientGenericWrapperService.put(obj, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return newObj;
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },


    delete: async function(entity: string, id, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            await this._rootHelper.appClientGenericWrapperService.del({_id: id._id || id}, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (options.loadingEnd) this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return {
                status: "success"
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },
    
    clear: async function(entity: string, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();
            await this._rootHelper.appClientGenericWrapperService.clear({}, {
                model: entity,
                primaryKeyName: '_id'
            });
            if (options.loadingEnd) this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return {
                status: "success"
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    load: async function(entity: string, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            await this._rootHelper.appClientGenericWrapperService.load({data: options.data}, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return {
                status: 'success'
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    lastSyncDate: async function(entity: string, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            let lastSyncDate = await this._rootHelper.appClientGenericWrapperService.lastSyncDate({}, {
                model: entity
            });

            if (options.message) await this._rootHelper.toast(options.message);

            return lastSyncDate;
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    fetch: async function(entity: string, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();

            await this._rootHelper.appClientGenericWrapperService.fetch({}, {
                model: entity,
                primaryKeyName: '_id'
            });

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return {
                status: 'success'
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    fetchMulty: async function(entities: string[], options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);

            if (options.loadingStart) await this._rootHelper.showLoading();
            for (let entity of entities) {
                await this._rootHelper.appClientGenericWrapperService.fetch({}, {
                    model: entity,
                    primaryKeyName: '_id'
                });
            }

            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);

            return {
                status: 'success'
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
        }
    },

    commonMethod: async function(method: string, data: any, options: any = {}) {
        try {
            options = this._rootHelper.getOptions(options);
            if (options.loadingStart) await this._rootHelper.showLoading();
            const res = await this._rootHelper.appClientGenericWrapperService[method](data);
            if (options.loadingEnd) await this._rootHelper.dismissLoading();
            if (options.message) await this._rootHelper.toast(options.message);
            return res != undefined ? res : {
                status: 'success'
            };
        } catch (e) {
            await this._rootHelper.errorCatch(e, options);
            return {
                status: 'failed'
            }
        }
    },

    isLoggedIn: async function() {
        return await this.commonMethod("isLoggedIn");
    },

    login: async function(data: {username?: string, password?: string, token?: string}, options: any = {}) {
        return await this.commonMethod("login", data, options);
    },
    loginAnonymously: async function(options: any = {}) {
        return await this.commonMethod("loginAnonymously", {}, options);
    },
    logout: async function(options: any = {}) {
        return await this.commonMethod("logout", {}, options);
    },
    clearUserData: async function(options: any = {}) {
        return await this.commonMethod("clearUserData", {}, options);
    },
    goOnline: async function(options: any = {}) {
        return await this.commonMethod("goOnline", {}, options);
    },
    goOffline: async function(options: any = {}) {
        return await this.commonMethod("goOffline", {}, options);
    },
    getState: async function(options: any = {}) {
        return await this.commonMethod("getState", {}, options);
    },
    getInstance: async function(options: any = {}) {
        return await this.commonMethod("getInstance", {}, options);
    },
    userCreate: async function(data: {username: string, password: string}, options: any = {}) {
        return await this.commonMethod("signup", data, options);
    },
    userUpdate: async function(data: {username: string, password: string}, options: any = {}) {
        return await this.commonMethod("updateUser", data, options);
    },
    userRemove: async function(options: any = {}) {
        return await this.commonMethod("removeUser", {}, options);
    },
    userGetData: async function(options: any = {}) {
        return await this.commonMethod("getCurrentUser", {}, options);
    },
    setSessionToken: async function(data: {token: string}, options: any = {}) {
        return await this.commonMethod("setSessionToken", data, options);
    },
    getSessionToken: async function() {
        const res = await this.commonMethod("getSessionToken");
        return res?.status === 'success' ? undefined : res;
    },
    getConflict: async function(options: any = {}) {
        return await this.commonMethod("getConflict", {}, options);
    },
    resetFailedSync: async function(options: any = {}) {
        return await this.commonMethod("resetFailedSync", {}, options);
    },
    resolveConflict: async function(data: {action?: string, data?: any} = {}, options: any = {}) {
        return await this.commonMethod("resolveConflict", {...{action: "UPDATE"}, ...data}, options);
    },
    retrySync: async function(options: any = {}) {
        return await this.commonMethod("retrySync", {}, options);
    },
    addListener: async function(event: string, listener: Function) {
        return await this._rootHelper.appClientGenericWrapperService.addListener(event, listener);
    },
    removeListener: async function(event: string, listener: Function) {
        return await this._rootHelper.appClientGenericWrapperService.removeListener(event, listener);
    },
};

export interface UtilsAppClientInterface {
    /** internal */
    getEntityById(entity: string, id, options ? ): Promise < any >;
    createEntity(entity: string, obj, options ? ): Promise < any >;
    updateEntity(entity: string, obj, options ? ): Promise < any >;
    commonMethod(method: string, data: any, options ? ): Promise < any >;
    _query(entity: string, params?: AexQueryParams, options ? ): Promise < any >;
    /** common */
    state: string;
    get(entity: string, id, options ? ): Promise < any >;
    query(entity: string, params?: AexQueryParams, options ? ): Promise < any >;
    queryOne(entity: string, params?: AexQueryParams, options ? ): Promise < any >;
    count(entity: string, params?: {where?: any}, options ? ): Promise < any >;
    save(entity: string, obj, options ? ): Promise < any >;
    delete(entity: string, id, options ? ): Promise < any >;
    clear(entity: string, options ? ): Promise < any >;
    load(entity: string, options ? ): Promise < any >;
    lastSyncDate(entity: string, options ? ): Promise < any >;
    fetch(entity: string, options ? ): Promise < any >;
    fetchMulty(entities: string[], options ? ): Promise < any >;
    isLoggedIn(): Promise < boolean >;
    login(data: {username?: string, password?: string, token?: string}, options ? ): Promise < any >;
    loginAnonymously(options ? ): Promise < any >;
    logout(options ? ): Promise < any >;
    clearUserData(options ? ): Promise < any >;
    goOnline(options ? ): Promise < any >;
    goOffline(options ? ): Promise < any >;
    getState(options ? ): Promise < any >;
    getInstance(options ? ): Promise < any >;
    userCreate(data: {username: string, password: string}, options ? ): Promise < any >;
    userUpdate(data: {username: string, password: string}, options ? ): Promise < any >;
    userRemove(options ? ): Promise < any >;
    userGetData(options ? ): Promise < any >;
    setSessionToken(data: {token: string}, options ? ): Promise < any >;
    getSessionToken(): Promise < any >;
    getConflict(options ? ): Promise < any >;
    resetFailedSync(options ? ): Promise < any >;
    resolveConflict(data?: {action?: string, data?: any}, options ? ): Promise < any >;
    retrySync(options ? ): Promise < any >;
    addListener(event: string, listener: Function): Promise < any >;
    removeListener(event: string, listener: Function): Promise < any >;
};
