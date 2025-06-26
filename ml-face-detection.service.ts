import { Injectable } from '@angular/core';
import {executeCordovaPlugin, getPluginObject, toObservable} from './nativeUtils';
import { UtilsCommon } from '../utils/common';
import { from, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class MlFaceDetectionService {

  public static readonly PLUGIN_NAME = "ApperyioMLCordovaPlugin.FaceRecognizer";
  private $stop = new Subject();
  private realTimeInProgress = false;

  constructor() { }

  recognizeFace(imageUrlOrContent: string, options?: any): Promise<any> {
    return UtilsCommon.toPromise(getPluginObject(MlFaceDetectionService.PLUGIN_NAME, true).recognizeFace, {
      beginParameters: [imageUrlOrContent],
      endParameters: [options]
    });
  }

  startRealTimeFaceDetection(options?: any): Observable<any> {
    return from(this.stopRealTimeFaceDetection()).pipe(switchMap(()=>{
      this.realTimeInProgress = true;
      return toObservable(getPluginObject(MlFaceDetectionService.PLUGIN_NAME, true).startRealTimeFaceDetection, {
        endParameters: [options]
      }).pipe(filter(res => {
        if(res === "OK"){
          this.stopRealTimeFaceDetection();
          return false;
        }
        return true;
      }), takeUntil(this.$stop));
    }));
  }

  stopRealTimeFaceDetection(): Promise<any> {
    this.$stop.next();
    if(this.realTimeInProgress) {
        return executeCordovaPlugin(MlFaceDetectionService.PLUGIN_NAME, "stopRealTimeFaceDetection", true, false);
    }
    return Promise.resolve();
  }

}
