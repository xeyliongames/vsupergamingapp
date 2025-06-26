import { Injectable } from '@angular/core';
import { executeCordovaPlugin, isPluginObjectAvailable } from './nativeUtils';
import { Platform } from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class DocScannerService {

  public static readonly PLUGIN_NAME = "DocScannerPlugin";

  constructor(private platform: Platform) { }

  public isAvailable(): boolean {
    return this.platform.is("cordova") && isPluginObjectAvailable(DocScannerService.PLUGIN_NAME, true);
  }

  public scan(options = {}): Promise<any> {
    return executeCordovaPlugin(DocScannerService.PLUGIN_NAME, "scan", true, false, options);
  }

}
