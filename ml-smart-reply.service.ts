import { Injectable } from '@angular/core';
import { getPluginObject } from './nativeUtils';
import { UtilsCommon } from "../utils/common";


@Injectable({
  providedIn: 'root'
})
export class MlSmartReplyService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.SmartReply";

  constructor() { }

  suggestReplies(conversation: any[], options: any = {}): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlSmartReplyService.PLUGIN_NAME, true).suggestReplies, {
      beginParameters: [conversation],
      endParameters: [options]
    });
  }

}
