import { Injectable } from '@angular/core';
import { executeCordovaPlugin, getPluginObject } from './nativeUtils';
import { UtilsCommon } from "../utils/common";


@Injectable({
  providedIn: 'root'
})
export class MlEntityExtractionService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.EntityExtractor";

  constructor() { }

  getSupportedEntityExtractionModels(): Promise<any> {
    return executeCordovaPlugin(MlEntityExtractionService.PLUGIN_NAME, "getSupportedEntityExtractionModels", true, false);
  }

  getDownloadedEntityExtractionModels(): Promise<any> {
    return executeCordovaPlugin(MlEntityExtractionService.PLUGIN_NAME, "getDownloadedEntityExtractionModels", true, false);
  }

  downloadEntityExtractionModel(modelIdentifier: string): Promise<any> {
    return executeCordovaPlugin(MlEntityExtractionService.PLUGIN_NAME, "downloadEntityExtractionModel", true, true, modelIdentifier);
  }

  deleteEntityExtractionModel(modelIdentifier: string): Promise<any> {
    return executeCordovaPlugin(MlEntityExtractionService.PLUGIN_NAME, "deleteEntityExtractionModel", true, true, modelIdentifier);
  }

  extractEntities(text: string, modelIdentifier: string, options?: any): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlEntityExtractionService.PLUGIN_NAME, true).extractEntities, {
      beginParameters: [modelIdentifier, text],
      endParameters: [options]
    });
  }

}
