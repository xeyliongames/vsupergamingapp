enum FILE_FORMAT {
    "STRING" = 1,
    "ARRAY_BUFFER" = 2,
    "BLOB" = 3,
    "FORM_DATA" = 4,
    "DATA_URL" = 5
}

const networkStateChangeCallbacks = [];

export var UtilsCommon = {

    initUtils: function() {
        window.addEventListener("offline", () => { 
            if (!this.offline) {
                this.ngZone.run(() => {
                    this.offline = true;
                    this._runNetworkStateChange('offline');
                });
            }
        }, true);
        window.addEventListener("online", () => {
            if (this.offline) {
                this.ngZone.run(() => {
                    this.offline = false;
                    this._runNetworkStateChange('online');
                });
            }
        }, true);

        this.onWindowResize();
        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.initHttpUtils();
        this.db.initDBUtils(this);
        this.aex.initAEXUtils(this);

    },
    
    FILE_FORMAT: FILE_FORMAT,

    width: 0,
    height: 0,

    smUp: false,
    smDown: false,
    mdUp: false,
    mdDown: false,
    lgUp: false,
    lgDown: false,
    xlUp: false,
    xlDown: false,
    
    onWindowResize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.smUp = this.width >= 576;
        this.smDown = this.width < 576;
        this.mdUp = this.width >= 768;
        this.mdDown = this.width < 768;
        this.lgUp = this.width >= 992;
        this.lgDown = this.width < 992;
        this.xlUp = this.width >= 1200;
        this.xlDown = this.width < 1200;
    },    
    
    
    hexToRGB: function (hex, alpha = 0) {
        var r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
    },
    
    filterArray: function (array, condition: Function|Object|string) {
        return _.filter(array, condition);
    },

    removeFromArray: function (array, ...items) {
        _.pull.call(_, array, ...items);
        return [...array];
    },

    toggleArrayElement: function (array, item) {
        if (!_.isArray(array)) return;
        let index = array.indexOf(item);
        if (index === -1 && _.isObject(item)) index = _.findIndex(array, item);
        if (index !== -1) {
            array.splice(index, 1);
        } else {
            array.push(item);
        }
        return array;
    },

    saveToArray: function (array, item, idField = "_id") {
        if (item?.hasOwnProperty?.(idField)) {
            for (let obj of array) {
                if (obj?.hasOwnProperty?.(idField) && obj[idField] == item[idField]) {
                    this.replaceObject(obj, item);
                    return;
                }    
            }
        } else {
            for (let i = 0; i < array.length; i++) {
                if (array[i] === item) {
                    return;
                }
            }
        }
        array.push(item);
    },

    hasString: function(source: string[]|string, str: string, caseSensitive = false): boolean {
        if (str === undefined) str = "";
        if (str === "") return true;
        if (!str || !source) return false;
        if (!_.isArray(source)) {
            (<any>source) = [source];
        }
        if (!caseSensitive) {
            str = str.toLocaleLowerCase();
        }
        let s, i;
        for (i = 0; i < source.length; i++) {
            s = caseSensitive ? source[i] : source[i].toLocaleLowerCase();
            if (s.indexOf(str) !== -1) {
                return true;
            }
        }
        return false;
    },

    hasValue: function(source: any, value?: any): boolean {
        if (_.isArray(source) || _.isObject(source)) {
            let predicate = arguments.length === 1 ? (item) => item != undefined : (item) => item === value;
            return _.some(source, predicate);
        }
        return  arguments.length < 2 ? source != undefined : source === value;
    },

    generatePassword: function (len = 10): string {
        let length = (len) ? (len) : (10);
        let string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
        let numeric = '0123456789';
        let punctuation = '.;:_-~+=!@#$%^&*';
        let password = "";
        let character = "";
        while (password.length < length) {
            let entity1 = Math.ceil(string.length * Math.random() * Math.random());
            let entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
            let entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
            let hold = string.charAt(entity1);
            hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
            character += hold;
            character += numeric.charAt(entity2);
            character += punctuation.charAt(entity3);
            password = character;
        }
        password = password.split('').sort(function() {
            return 0.5 - Math.random()
        }).join('');
        return password.substr(0, len);
    },    
    

    generateUUID: function (): string { // Public Domain/MIT
        var d = new Date().getTime(); //Timestamp
        var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) { //Use timestamp until depleted
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else { //Use microseconds since page-load if supported
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    lang: '',
    offline: false,

    onNetworkStateChange: function(cb: Function) {
        networkStateChangeCallbacks.push(cb)
    },

    offNetworkStateChange: function(cb: Function) {
        this.removeFromArray(networkStateChangeCallbacks, cb)
    },
    
    _runNetworkStateChange: function(state: string) {
        networkStateChangeCallbacks.forEach(cb => {
            cb.call(this, state);
        })
    },

    setLang: function(lang) {
        this.translate.use(lang);
        this.lang = lang;
    },
    
    setTheme: function(theme) {
        this.theme.set(theme);
    },

    getLang: function(): string {
        return this.lang;
    },

    getVariable: function(varName) {
        return this.data.getVariable(varName);
    },

    getConfig: function(configName, scope = 'Settings') {
        if (!this.config.constants[scope]) return null;
        return this.config.get(`${scope}.${configName}`);
    },
    
    getValueFromObject: function(obj, properties = ['description', 'message', 'error'], notNull = true) {
        if (typeof obj !== "object" || obj == null) return obj;
        for (let i = 0; i < properties.length; i++) {
            if (obj[properties[i]] !== undefined && (!notNull || notNull && obj[properties[i]] !== '' && obj[properties[i]] != null)) {
                return obj[properties[i]];
            }
        }
        return undefined;
    },

    showError: async function(e) {
        let message = '';

        await this.dismissLoading();
        if (typeof e == 'string') {
            try {
                e = JSON.parse(e);
            } catch (err) {
                message = e;
            }
        }
        if (e?.name === 'HttpErrorResponse' && e?.status === 0) {
            message = "Error: Internet connection issue. Please check your connection and try again.";
        } else {
            if (_.isObject(e)) {
                message = this.getValueFromObject(e?.error);
                if (!message || typeof message !== "string") {
                    message = this.getValueFromObject(e?.error?.error);
                    if (!message || typeof message !== "string") {
                        message = this.getValueFromObject(e);
                    }
                }
            }
        }
        if (!message || typeof message !== "string") {
            message = 'Some error has occurred';
        }

        return await this.alert(message, 'Error');
    },

    toast: async function(message, header?, {color = 'success', position = 'bottom', duration = 1000, buttons = undefined} = {}) {
        const toast = await this.getController("ToastController").create({
            header: header ? this.translate.instant(header) : undefined,
            message: message ? this.translate.instant(message) : undefined,
            color,
            position,
            duration,
            buttons
        })

        await toast.present();
        return toast;
    },

    alert: async function(message, header?, func?, options: {cssClass?, subHeader?, backdropDismiss?, htmlAttributes?, buttons?: any[], buttonText?: string, mode?: string, inputs?} = {}) {
        const alert = await this.getController("AlertController").create({
            header: header ? this.translate.instant(header) : undefined,
            message: message ? this.translate.instant(message) : undefined,
            mode: options?.mode ? options.mode : undefined,
            cssClass: options?.cssClass || '',
            subHeader: options?.subHeader ? this.translate.instant(options.subHeader) : undefined,
            backdropDismiss: options?.backdropDismiss !== undefined ? options?.backdropDismiss : true,
            htmlAttributes: options?.htmlAttributes,
            inputs: options?.inputs || undefined,
            buttons: options.buttons || [{
                text: this.translate.instant(options.buttonText || 'Ok'),
                role: "ok",
                handler: () => {
                    if (_.isFunction(func)) return func();
                }
            }]
        });

        await alert.present();
        return alert;
    },

    alertOkCancel: async function(message, header, funcOk?, funcCancel?, options: {cssClass?, subHeader?, backdropDismiss?, htmlAttributes?, okButtonText?: string, cancelButtonText?: string, mode?: string, inputs?} = {}) {
        const alert = await this.getController("AlertController").create({
            header: header ? this.translate.instant(header) : undefined,
            message: message ? this.translate.instant(message) : undefined,
            mode: options?.mode ? options.mode : undefined,
            cssClass: options?.cssClass || '',
            subHeader: options?.subHeader ? this.translate.instant(options.subHeader) : undefined,
            backdropDismiss: options?.backdropDismiss !== undefined ? options?.backdropDismiss : false,
            htmlAttributes: options?.htmlAttributes,
            inputs: options?.inputs || undefined,
            buttons: [{
                text: this.translate.instant(options.cancelButtonText || 'Cancel'),
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                    if (_.isFunction(funcCancel)) return funcCancel();
                }
            }, {
                text: this.translate.instant(options.okButtonText || 'Ok'),
                role: 'ok',
                handler: () => {
                    if (_.isFunction(funcOk)) return funcOk();
                }
            }]
        });

        await alert.present();
        return alert;
    },

    alertAsync: async function(message, header?, options: {cssClass?, subHeader?, backdropDismiss?, htmlAttributes?, buttonText?: string, mode?: string, inputs?} = {}) {
        return new Promise(async (res) => {
            const alert = await this.getController("AlertController").create({
                header: header ? this.translate.instant(header) : undefined,
                message: message ? this.translate.instant(message) : undefined,
                mode: options?.mode ? options.mode : undefined,
                cssClass: options?.cssClass || '',
                subHeader: options?.subHeader ? this.translate.instant(options.subHeader) : undefined,
                backdropDismiss: options?.backdropDismiss !== undefined ? options?.backdropDismiss : true,
                htmlAttributes: options?.htmlAttributes,
                inputs: options?.inputs || undefined,
                buttons: [{
                    text: this.translate.instant(options.buttonText || 'Ok'),
                    role: 'ok',
                }]
            });
            alert.onDidDismiss().then(data => {
                if (options?.inputs) {
                    res(data.data?.values);
                } else {
                    res(true);
                }
            });
            await alert.present();
        });
    },

    alertOkCancelAsync: async function(message, header, options: {cssClass?, subHeader?, backdropDismiss?, htmlAttributes?, okButtonText?: string, cancelButtonText?: string, mode?: string, inputs?} = {}) {
        return new Promise(async (res) => {
            const alert = await this.getController("AlertController").create({
                header: header ? this.translate.instant(header) : undefined,
                message: message ? this.translate.instant(message) : undefined,
                mode: options?.mode ? options.mode : undefined,
                cssClass: options?.cssClass || '',
                subHeader: options?.subHeader ? this.translate.instant(options.subHeader) : undefined,
                backdropDismiss: options?.backdropDismiss !== undefined ? options?.backdropDismiss : false,
                htmlAttributes: options?.htmlAttributes,
                inputs: options?.inputs || undefined,
                buttons: [{
                    text: this.translate.instant(options.cancelButtonText || 'Cancel'),
                    role: 'cancel',
                    cssClass: 'secondary',
                }, {
                    text: this.translate.instant(options.okButtonText || 'Ok'),
                    role: "ok",
                }]
            });
            alert.onDidDismiss().then(data => {
                if (data.role === "ok" && options?.inputs) {
                    res(data.data?.values);
                } else {
                    res(data.role === "ok");
                }
            });
            await alert.present();
        });
    },

    markFormAsTouched: function(form, markAllAsTouched = true): boolean {
        try {
            if (markAllAsTouched) form?.form?.markAllAsTouched();
        } catch (e) {
            console.log(e);
        }
        return form?.invalid;
    },

    closeModal: function(data: any = null) {
        this.getController("ModalController").dismiss(data);
    },


    modal: async function(screenName, componentProps: any = {}, options: any = {}) {
        const defaults = {
            componentProps: componentProps,
            showBackdrop: true,
            backdropDismiss: false,
            cssClass: "",
            animated: true,
            keyboardClose: true
        };

        const modal = await this.showModal(screenName, { ...defaults, ...options });
        modal.present();
        let data = await modal.onDidDismiss();
        return data?.data;
    },

    dismissLoading: async function() {
        while (await this.loadingController.getTop() !== undefined) {
            try {
                await this.loadingController.dismiss();
                await this.timeout(10);
            } catch (e) {
                console.log(e);
            }
        }
    },

    showLoading: async function(message = 'Please wait...', spinner = 'crescent') {
        await this.dismissLoading();

        const loading = await this.loadingController.create({
            message: message ? this.translate.instant(message) : undefined,
            spinner: spinner
        });

        await loading.present();
        return loading;
    },

    errorCatch: async function(e, options: any = {}) {
        console.log(e);
        if (options.loadingEnd) await this.dismissLoading();
        if (options.showError) await this.showError(options.errorMessage || e);
        if (options.throwError) throw e;
    },

    resizeImage: function(base64image, { width = 0, height = 0, maxSize = 409600, aspectRatio = true } = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.isDataURL(base64image)) {
                base64image = "data:;base64," + base64image;
            }
            let img = new Image();
            img.src = base64image;

            img.onload = () => {
                height ||= img.height;
                width ||= img.width;

                if (aspectRatio) {
                    if (img.height > img.width) {
                        width = Math.floor(height * (img.width / img.height));
                    } else {
                        height = Math.floor(width * (img.height / img.width));
                    }
                }
                // Now do final resize for the image to meet the dimension requirments
                // directly to the output canvas, that will output the final image
                let outputCanvas: HTMLCanvasElement = document.createElement('canvas');
                let outputCanvasContext = outputCanvas.getContext("2d");

                outputCanvas.width = width;
                outputCanvas.height = height;

                outputCanvasContext.drawImage(img, 0, 0, img.width, img.height,
                    0, 0, width, height);

                // output the canvas pixels as an image. params: format, quality
                let quality = 1;
                let base64ResizedImage = outputCanvas.toDataURL('image/jpeg', quality);

                while (base64ResizedImage.length > maxSize && quality > 0.1) {
                    quality -= 0.05;
                    base64ResizedImage = outputCanvas.toDataURL('image/jpeg', quality);
                }
                resolve(base64ResizedImage);
            };
        });
    },

    DEFAULT_FORMAT: FILE_FORMAT.FORM_DATA,
    DEFAULT_FILE_NAME: "file.dat",
    DEFAULT_FILE_TYPE: "application/octet-stream",

    convertData: function(ab: ArrayBuffer|string, format: number, type = this.DEFAULT_FILE_TYPE, name = this.DEFAULT_FILE_NAME) {
        let result: any = ab;
        if (format === FILE_FORMAT.BLOB || format === FILE_FORMAT.FORM_DATA) {
            result = new Blob([ab], {
                type: type || this.DEFAULT_FILE_TYPE
            });
        }
        if (format === FILE_FORMAT.FORM_DATA) {
            const formData = new FormData();
            const fileName = name || this.DEFAULT_FILE_NAME;
            formData.append(fileName, result, fileName);
            result = formData;
        }
        return result;
    },

    readFile: function(file, format: FILE_FORMAT = FILE_FORMAT.DATA_URL, type = this.DEFAULT_FILE_TYPE, name = this.DEFAULT_FILE_NAME): Promise<any> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                let result: any = reader.result;
                if (format !== FILE_FORMAT.STRING) {
                    result = this.convertData(result, format, type || file.type, name || file.name);
                }
                resolve(result);
            };
            reader.onerror = () => {
                reader.abort();
                reject('Error while reading file.');
            };
            switch (format) {
                case FILE_FORMAT.STRING:
                    reader.readAsText(file);
                    break;
                case FILE_FORMAT.DATA_URL:
                    reader.readAsDataURL(file);
                    break;
                default:
                    reader.readAsArrayBuffer(file);
            }
        });
    },

    updateApp: async function(message = "Installing updates") {
        return new Promise((resolve, reject) => {
            if (window.cordova && window.chcp && !document.location.host.includes("appery.io")) {
                window.chcp.fetchUpdate((error, data) => {
                    console.log('error', error);
                    console.log('data', data);
                    if (!error) {
                        this.showLoading(message);
                        window.chcp.installUpdate(error => {
                            console.log(error);
                            this.dismissLoading();
                            resolve(true);
                        });
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    },

    replaceObject: function(origin, source) {
        if (origin === source) return;
        Object.keys(origin).forEach(key => delete origin[key]);
        _.assign(origin, source);
    },

    setRole(role){
        this._role = role;
    },
    hasRole(...roles){
        return roles.indexOf(this._role) !== -1;
    },

    service: async function(name: string, data: any = {}, options: any = {}) {
        try {
            options = this.getOptions(options);

            if (options.loadingStart) await this.showLoading();

            const service = await this.getService(name);
            const obj = await service.execute(data).toPromise();
            if (options.loadingEnd) await this.dismissLoading();
            if (options.message) await this.toast(options.message);

            return obj || {
                status: 'success'
            };
        } catch (e) {
            await this.errorCatch(e, options);
            return undefined;
        }
    },

    
    loadScript: function(src: string, isModule = false): Promise<any> {
        return new Promise((res, rej) => {
            const script = document.createElement("script");
            script.src = src;
            script.id = "script_" + new Date().getTime();
            if (isModule) script.type = "module";
            document.head.append(script);
            script.onload = () => {
                res(true);
            }
            script.onerror = () => {
                rej();
            }
        });
    },

    setSession: function(name, value) {
        sessionStorage[name] = JSON.stringify(value);
    },

    getSession: function(name) {
        try {
            return JSON.parse(sessionStorage[name]);
        } catch (e) {
            return null;
        }
    },


    setLocal: function(name, value) {
        localStorage[name] = JSON.stringify(value);
    },

    getLocal: function(name) {
        try {
            return JSON.parse(localStorage[name]);
        } catch (e) {
            return null;
        }
    },

    setStorage: async function(name, value) {
        return await this.data.setStorage(name, value);
    },

    getStorage: async function(name) {
        return await this.data.getStorage(name);
    },

    removeStorage: async function(name) {
        return await this.data.removeStorage(name);
    },

    convertBase64ToBlob: function(base64Image: string): Blob {

        if (this.isDataURL(base64Image)) {
            base64Image = this.dataURLtoBase64(base64Image);
        }

        // Decode Base64 string
        const decodedData = window.atob(base64Image);

        // Create UNIT8ARRAY of size same as row data length
        const uInt8Array = new Uint8Array(decodedData.length);

        // Insert all character code into uInt8Array
        for (let i = 0; i < decodedData.length; ++i) {
            uInt8Array[i] = decodedData.charCodeAt(i);
        }

        // Return BLOB image after conversion
        return new Blob([uInt8Array]);
    },

    convertBlobToBase64: function(blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64: string = reader.result as string;
                resolve(base64.split(',')[1]);
            };
            reader.onerror = () => {
                resolve("");
            };
            reader.readAsDataURL(blob);
        });
    },

    Uint8ToBase64: function(u8Arr) {
        var CHUNK_SIZE = 0x8000; //arbitrary number
        var index = 0;
        var length = u8Arr.length;
        var result = '';
        var slice;
        while (index < length) {
            slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return btoa(result);
    },

    dataURLtoFile: function(dataURL: string, filename: string): File {
        let arr = dataURL.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, {
            type: mime
        });
    },

    dataURLtoBase64: function(dataURL): string {
        return dataURL.split(',')[1];
    },

    getMediaTypeFromDataURL: function(dataURL: string): string {
        const defType = this.DEFAULT_FILE_TYPE;
        if (this.isDataURL(dataURL)) {
            let type = dataURL.split(',')[0].substring(5);
            if (type) {
                return type.split(';')[0];
            }
        }
        return defType;
    },

    isDataURL: function(dataUrl: string): boolean {
        return dataUrl.startsWith('data:');
    },
    scrollTop: function(target, {duration = 300, timeout = 300} = {}) {
        if (!target) return;
        if (target._aio_content?.scrollToTop && _.isFunction(target._aio_content.scrollToTop)) {
            setTimeout(() => target._aio_content?.scrollToTop(duration), timeout);
            return;
        }
        if (target.constructor?.name === 'IonContent') {
            setTimeout(() => target.scrollToTop(duration, timeout));
            return;
        }
        if (target.nativeElement) {
            target = target.nativeElement;
        }
        if (target.scroll) {
            setTimeout(() => target.scroll({
                top: 0,
                behavior: "smooth",
            }), timeout);
        }
    },
    scrollBottom: function(target, {duration = 300, timeout = 300} = {}) {
        if (!target) return;
        if (target._aio_content?.scrollToBottom && _.isFunction(target._aio_content.scrollToBottom)) {
            setTimeout(() => target._aio_content?.scrollToBottom(duration), timeout);
            return;
        }
        if (target.constructor?.name === 'IonContent') {
            setTimeout(() => target.scrollToBottom(duration), timeout);
            return;
        }
        if (target.nativeElement) {
            target = target.nativeElement;
        }
        if (target.scroll) {
            setTimeout(() => target.scroll({
                top: 1e7,
                behavior: "smooth",
            }, timeout));
        }
    },

    timeout: function(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    toPromise: function(func, ...options): Promise<any> {
        if (!func) return undefined;
        if (typeof func != 'function') return undefined;

        let beginParameters = [],
            endParameters = [],
            alwaysResolve = false,
            errorFirst = false,
            onlySuccess = false;

        if (options.length == 1 && typeof options[0] == 'object' && (options[0].beginParameters || options[0].endParameters || options[0].alwaysResolve || options[0].errorFirst || options[0].onlySuccess)) {
            beginParameters = options[0].beginParameters || beginParameters;
            endParameters = options[0].endParameters || endParameters;
            alwaysResolve = options[0].alwaysResolve || alwaysResolve;
            errorFirst = options[0].errorFirst || errorFirst;
            onlySuccess = options[0].onlySuccess || onlySuccess;
        } else {
            endParameters = options;
        }

        return new Promise((res, rej) => {
            let args = [...beginParameters];
            const reject = alwaysResolve ? res : rej;
            if (onlySuccess) {
                args = args.concat((result) => res(result));
            } else if (errorFirst) {
                args = args.concat((err) => reject(err), (result) => res(result));
            } else {
                args = args.concat((result) => res(result), (err) => reject(err));
            }
            args = args.concat(...endParameters);
            console.log('ff');
            func.apply(undefined, args);
        });
    }

};

export interface UtilsCommonInterface {
    /** internal */
    initUtils();
    errorCatch(e, options: any): Promise<any>;
    convertData(ab: ArrayBuffer|string, format: number, type?: string, name?: string);
    _runNetworkStateChange(state: string);
    /** common */
    FILE_FORMAT: typeof FILE_FORMAT,
    lang: string;
    offline: boolean;
    width: number;
    height: number;
    smUp: boolean;
    smDown: boolean;
    mdUp: boolean;
    mdDown: boolean;
    lgUp: boolean;
    lgDown: boolean;
    xlUp: boolean;
    xlDown: boolean;
    hexToRGB(hex: string, alpha?: number): string;
    filterArray(array: any[], condition: Function|Object|string): any[];
    removeFromArray(array: any[], ...items): any[];
    toggleArrayElement(array: any[], item): any[];
    saveToArray(array: any[], item, idField?: string): void;
    hasString(source: string[]|string, str: string, caseSensitive?: boolean): boolean;
    hasValue(source: any, value?: any): boolean;
    generatePassword(len?: number): string;
    generateUUID(): string;
    onNetworkStateChange(cb: Function);
    offNetworkStateChange(cb: Function);
    setLang(lang: string);
    setTheme(theme: string);
    getLang(): string;
    getVariable(varName: string);
    getConfig(configName: string, scope?: string);
    getValueFromObject(obj, properties?: string[], notNull?: boolean);
    showError(e): Promise<any>;
    toast(message: string, header?: string, options?: {color?: string, position?: string, duration?: number, buttons?: any}): Promise<any>;
    alert(message: string, header?: string, func?: Function, options?: {cssClass?: string, subHeader?: string, backdropDismiss?: boolean, htmlAttributes?, buttons?: any[], buttonText?: string, mode?: string}, inputs?): Promise<any>;
    alertOkCancel(message: string, header?: string, funcOk?: Function, funcCancel?: Function, options?: {cssClass?: string, subHeader?: string, backdropDismiss?: boolean, htmlAttributes?, okButtonText?: string, cancelButtonText?: string, mode?: string, inputs?}): Promise<any>;
    alertAsync(message: string, header?: string, options?: {cssClass?: string, subHeader?: string, backdropDismiss?: boolean, htmlAttributes?, buttons?: any[], buttonText?: string, mode?: string, inputs?}): Promise<any>;
    alertOkCancelAsync(message: string, header?: string, options?: {cssClass?: string, subHeader?: string, backdropDismiss?: boolean, htmlAttributes?, okButtonText?: string, cancelButtonText?: string, mode?: string, inputs?}): Promise<any>;
    markFormAsTouched(form, markAllAsTouched?: boolean): boolean;
    closeModal(data?: any);
    modal(screenName: string, componentProps?, options?): Promise<any>;
    dismissLoading(): Promise<any>;
    showLoading(message?: string, spinner?: string): Promise<any>;
    resizeImage(base64image: string, options?: {width?: number; height?: number; maxSize?: number; aspectRatio?: boolean}): Promise<string>;
    readFile(file, format?: FILE_FORMAT, type?: string, name?: string): Promise<any>;
    updateApp(message?: string): Promise<any>;
    replaceObject(origin, source);
    setRole(role): void;
    hasRole(...roles): boolean;
    service(name: string, data? , options?): Promise<any>;
    loadScript(src: string, isModule?): Promise<any>;
    setSession(name: string, value);
    getSession(name: string);
    setLocal(name: string, value);
    getLocal(name: string);
    setStorage(name: string, value): Promise<any>;
    getStorage(name: string): Promise<any>;
    removeStorage(name: string): Promise<any>;
    convertBase64ToBlob(base64Image: string): Blob;
    convertBlobToBase64(blob): Promise<string>;
    Uint8ToBase64(u8Arr);
    dataURLtoFile(dataURL: string, filename: string): File;
    dataURLtoBase64(dataURL: string): string;
    getMediaTypeFromDataURL(dataURL: string): string;
    isDataURL(dataUrl: string): boolean;
    scrollTop(target, options?: {duration?: number, timeout?: number}): void;
    scrollBottom(target, options?: {duration?: number, timeout?: number}): void;
    timeout(ms: number): Promise<any>;
    toPromise(func, ...options): Promise<any>;
};
