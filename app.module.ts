import {
    NgModule
} from '@angular/core';
import {
    BrowserModule
} from '@angular/platform-browser';
import {
    BrowserAnimationsModule
} from '@angular/platform-browser/animations';
import {
    FormsModule
} from '@angular/forms';
import {
    HttpClientModule
} from '@angular/common/http';
import {
    IonicModule
} from '@ionic/angular';
import {
    IonicStorageModule
} from '@ionic/storage';
import {
    ApperyioModule
} from './scripts/apperyio/apperyio.module';
import {
    ApperyioDeclarablesModule
} from './scripts/apperyio/declarables/apperyio.declarables.module';
import {
    PipesModule
} from './scripts/pipes.module';
import {
    DirectivesModule
} from './scripts/directives.module';
import {
    ComponentsModule
} from './scripts/components.module';
import {
    CustomComponentsModule
} from './scripts/custom-components.module';
import {
    CustomModulesModule
} from './scripts/custom-modules.module';
import {
    Sanitizer
} from '@angular/core';
import {
    NgDompurifySanitizer
} from '@tinkoff/ng-dompurify';
import {
    createTranslateLoader
} from './scripts/apperyio/translate_module';
import {
    TranslateModule
} from '@ngx-translate/core';
import {
    TranslateLoader
} from '@ngx-translate/core';
import {
    HttpClient
} from '@angular/common/http';
import {
    app
} from './app';
import {
    AppRoutingModule
} from './app-routing.module';
import {
    WebView
} from '@ionic-native/ionic-webview/ngx';
import {
    Device
} from '@ionic-native/device/ngx';
import {
    SplashScreen
} from '@ionic-native/splash-screen/ngx';
import {
    StatusBar
} from '@ionic-native/status-bar/ngx';
import {
    Keyboard
} from '@ionic-native/keyboard/ngx';
import {
    Network
} from '@ionic-native/network/ngx';
import {
    SecureStorage
} from '@ionic-native/secure-storage/ngx';
import {
    InAppBrowser
} from '@ionic-native/in-app-browser/ngx';
( < any > NgDompurifySanitizer.prototype)._sanitize_fn = NgDompurifySanitizer.prototype.sanitize;
NgDompurifySanitizer.prototype.sanitize = function(...args) {
    let value: any = args[1];
    if (value && value.hasOwnProperty("changingThisBreaksApplicationSecurity")) {
        args[1] = value.changingThisBreaksApplicationSecurity
    }
    return this._sanitize_fn(...args);
}
var getIonicModuleConfig, getIonicStorageModuleConfig;
@NgModule({
    declarations: [
        app
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        IonicModule.forRoot((typeof getIonicModuleConfig === "function")? getIonicModuleConfig(): undefined),
        HttpClientModule,
        ApperyioModule,
        PipesModule,
        DirectivesModule,
        ComponentsModule,
        ApperyioDeclarablesModule,
        CustomComponentsModule,
        CustomModulesModule,
        IonicStorageModule.forRoot((typeof getIonicStorageModuleConfig === "function")? getIonicStorageModuleConfig(): undefined),
        AppRoutingModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        })
    ],
    bootstrap: [
        app
    ],
    entryComponents: [
        //app
    ],
    providers: [
        StatusBar,
        SplashScreen,
        WebView,
        Device,
        Keyboard,
        Network,
        SecureStorage,
        {
            provide: Sanitizer,
            useClass: NgDompurifySanitizer,
        },
        InAppBrowser,
        InAppBrowser
    ]
})
export class AppModule {}