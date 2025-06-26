import { Injectable } from '@angular/core';
import { executeCordovaPlugin, getPluginObject } from './nativeUtils';
import { UtilsCommon } from '../utils/common';


@Injectable({
  providedIn: 'root'
})
export class MlTranslatorService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.Translator";

  constructor() { }

  identifyLanguage(text: string,options?: any): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlTranslatorService.PLUGIN_NAME, true).identifyLanguage, {
      beginParameters: [text],
      endParameters: [options]
    });
  }

  translate(text: string, sourceLang: string, targetLang: string): Promise<any> {
    return executeCordovaPlugin(MlTranslatorService.PLUGIN_NAME, "translate", true, true, text, sourceLang, targetLang);
  }

  getDownloadedModels(): Promise<any> {
    return executeCordovaPlugin(MlTranslatorService.PLUGIN_NAME, "getDownloadedModels", true, false);
  }

  downloadModel(code: string): Promise<any> {
    return executeCordovaPlugin(MlTranslatorService.PLUGIN_NAME, "downloadModel", true, true, code);
  }

  deleteModel(code: string): Promise<any> {
    return executeCordovaPlugin(MlTranslatorService.PLUGIN_NAME, "deleteModel", true, true, code);
  }

  getSupportedLanguages(code: string): Promise<any> {
    return executeCordovaPlugin(MlTranslatorService.PLUGIN_NAME, "getSupportedLanguages", true);
  }

}
