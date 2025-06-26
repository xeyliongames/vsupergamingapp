import { Injectable } from '@angular/core';
import {executeCordovaPlugin, getPluginObject, toObservable} from './nativeUtils';
import { UtilsCommon } from '../utils/common';
import { from, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MlTextRecognitionService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.TextRecognizer";
  private $stop = new Subject();
  private realTimeInProgress = false;

  constructor() { }

  recognizeText(imageUrlOrContent: string, options?: any): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlTextRecognitionService.PLUGIN_NAME, true).recognizeText, {
      beginParameters: [imageUrlOrContent],
      endParameters: [options]
    });
  }

  startRealTimeRecognition(options?: any): Observable<any> {
    return from(this.stopRealTimeRecognition()).pipe(switchMap(()=>{
      this.realTimeInProgress = true;
      return toObservable(getPluginObject(MlTextRecognitionService.PLUGIN_NAME, true).startRealTimeRecognition, {
        endParameters: [options]
      }).pipe(filter(res => {
        if(res === "OK"){
          this.stopRealTimeRecognition();
          return false;
        }
        return true;
      }), takeUntil(this.$stop));
    }));
  }

  stopRealTimeRecognition(): Promise<any> {
    this.$stop.next();
    if(this.realTimeInProgress) {
        return executeCordovaPlugin(MlTextRecognitionService.PLUGIN_NAME, "stopRealTimeRecognition", true, false);
    }
    return Promise.resolve();
  }

}
