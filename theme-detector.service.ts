import { Injectable } from '@angular/core';
import { executeCordovaPlugin } from './nativeUtils';

interface ThemeDetectionResponse {
  value: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeDetectorService {

  public static readonly PLUGIN_NAME = "ThemeDetection";

  constructor() { }

  public async isAvailable(): Promise<boolean> {
    try {
      const response: ThemeDetectionResponse = await executeCordovaPlugin(ThemeDetectorService.PLUGIN_NAME, "isAvailable", false);
      return response.value;
    } catch (error) {
      console.error(`ThemeDetectorService isAvailable error: '${error}'`);
      return false;
    }
  }

  public async isDarkModeEnabled(): Promise<boolean> {
    try {
      const response: ThemeDetectionResponse = await executeCordovaPlugin(ThemeDetectorService.PLUGIN_NAME, "isDarkModeEnabled", false);
      return response.value;
    } catch (error) {
      console.error(`ThemeDetectorService isDarkModeEnabled error: '${error}'`);
      return false;
    }
  }

}
