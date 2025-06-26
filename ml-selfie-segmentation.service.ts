import { Injectable } from '@angular/core';
import { getPluginObject } from './nativeUtils';
import { UtilsCommon } from "../utils/common";


@Injectable({
  providedIn: 'root'
})
export class MlSelfieSegmentationService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.SelfieSegmenter";

  constructor() { }

  segmentSelfie(imageUrlOrContent: string, options?: any): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlSelfieSegmentationService.PLUGIN_NAME, true).segmentSelfie, {
      beginParameters: [imageUrlOrContent],
      endParameters: [options]
    });
  }

}
