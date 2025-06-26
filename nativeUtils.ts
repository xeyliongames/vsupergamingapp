import {Observable} from "rxjs";

export function getPluginObject(pluginName: string, useGlobal: boolean) {
    const nameParts = pluginName.split(".");
    let pluginObject = useGlobal ? window[nameParts[0]] : cordova.plugins[nameParts[0]];
    for(let i = 1; i<nameParts.length; i++) {
        pluginObject = pluginObject[nameParts[i]];
    }
    return pluginObject;
}

export function executeCordovaPlugin<T>(pluginName: string, methodName: string, useGlobal: boolean, paramsFirst? :boolean, ...args): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        try {
            let pluginObject = getPluginObject(pluginName, useGlobal);
            let pluginParams = [(response: T) => resolve(response), (error: any) => reject(error)];
            if(paramsFirst) {
                pluginParams = args.concat(pluginParams);
            } else {
                pluginParams = pluginParams.concat(args);
            }
            pluginObject[methodName].apply(pluginObject, pluginParams);
        } catch (ex) {
            console.error(`executeCordovaPlugin '${pluginName}:${methodName}' error: ${ex}`);
            reject(ex);
        }
    });
}

export function isPluginObjectAvailable(pluginName: string, useGlobal: boolean): boolean {
    return !!getPluginObject(pluginName, useGlobal);
}

export function toObservable(func, ...options): Observable<any> {
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

    return new Observable((observer) => {
        let args = [...beginParameters];
        const reject = alwaysResolve ? observer.next : observer.error;
        if (onlySuccess) {
            args = args.concat((result) => observer.next(result));
        } else if (errorFirst) {
            args = args.concat((err) => reject(err), (result) => observer.next(result));
        } else {
            args = args.concat((result) => observer.next(result), (err) => reject(err));
        }
        args = args.concat(...endParameters);
        func.apply(undefined, args);
    });
}
