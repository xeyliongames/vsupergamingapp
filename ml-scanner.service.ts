import { Injectable } from '@angular/core';
import { executeCordovaPlugin } from './nativeUtils';

@Injectable({
  providedIn: 'root'
})
export class MlScannerService {

  public static readonly PLUGIN_NAME = "mlkit.barcodeScanner";

  public scan(options = {}): Promise<any> {
    return executeCordovaPlugin(MlScannerService.PLUGIN_NAME, "scan", false, true, options);
  }

}
