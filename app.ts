import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from './scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from './scripts/apperyio/apperyio_mapping_helper';
import {
    MenuController
} from '@ionic/angular';
import {
    NavController
} from '@ionic/angular';
import {
    Platform
} from '@ionic/angular';
import {
    ViewChild
} from '@angular/core';
import {
    SplashScreen
} from '@ionic-native/splash-screen/ngx';
import {
    StatusBar
} from '@ionic-native/status-bar/ngx';
import {
    $aio_empty_object
} from './scripts/interfaces';
@Component({
    templateUrl: 'app.html',
    selector: 'app-root',
    styleUrls: ['app.css', 'app.scss']
})
export class app {
    public deviceType: string = 'web-browser';
    public $a: ApperyioHelperService;
    public $v: {
        [name: string]: any
    };
    public aioChangeDetector: ChangeDetectorRef;
    public currentItem: any = null;
    @ViewChild('_aio_content') _aio_content;
    public mappingData: any = {};
    public __getMapping(_currentItem, property, defaultValue, isVariable?, isSelected?) {
        return this.$aio_mappingHelper.getMapping(this.mappingData, _currentItem, property, defaultValue, isVariable, isSelected);
    }
    public __isPropertyInMapping(_currentItem, property) {
        return this.$aio_mappingHelper.isPropertyInMapping(this.mappingData, _currentItem, property);
    }
    public __setMapping(data: any = {}, keyName: string, propName?: string): void {
        const changes = data.detail || {};
        if (propName) {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes[propName]);
        } else {
            this.mappingData = this.$aio_mappingHelper.updateData(this.mappingData, [keyName], changes.value);
        }
        this.$aio_changeDetector.detectChanges();
    }
    public __bindedMethods: any = {};
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public menuCtrl: MenuController) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.aioChangeDetector = this.$aio_changeDetector;
        this.deviceType = window.cordova? 'mobile': 'web-browser';
        // this language will be used as a fallback when a translation isn't found in the current language 
        this.Apperyio.translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the current loader to get them 
        this.$a.setLang('en');
        // do not remove this code unless you know what you do
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            if (window.cordova?.InAppBrowser?.open) {
                window.open = cordova.InAppBrowser.open;
            }
            window.StatusBar?.show();
            // var ref = window.cordova.InAppBrowser.open("https://ancipov.wixsite.com/website", '_blank', 'location=no');
            // ref.addEventListener('loadstop', function() {
            //     ref.executeScript({
            //         code: `
            //     alert(2);
            //     document.getElementById("WIX_ADS")?.remove();
            //     `
            //     });
            // });
            // ref.addEventListener('loaderror', function() {
            //     ref.executeScript({
            //         code: `
            //     alert('error');
            //     `
            //     });
            // });
        });
    }
    ngOnInit() {
        this.$a.preload.components(["ion-input", "ion-modal", "ion-textarea", "ion-toast", "ion-datetime", "ion-select", "ion-popover", "ion-item"]);
        this.Apperyio.setThinScrollIfNeeded();
    }
    ionViewWillEnter() {
        window.currentScreen = this;
    }
}