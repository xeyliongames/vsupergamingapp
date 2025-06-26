import {
    Component
} from '@angular/core';
import {
    ChangeDetectorRef
} from '@angular/core';
import {
    ApperyioHelperService
} from '../scripts/apperyio/apperyio_helper';
import {
    ApperyioMappingHelperService
} from '../scripts/apperyio/apperyio_mapping_helper';
import {
    Platform
} from '@ionic/angular';
import {
    $aio_empty_object
} from '../scripts/interfaces';
import {
    ViewChild
} from '@angular/core';
@Component({
    templateUrl: 'home.html',
    selector: 'page-home',
    styleUrls: ['home.css', 'home.scss']
})
export class home {
    public time: any;
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
    @ViewChild('formenter', {
        static: true
    }) public formenter;
    constructor(public Apperyio: ApperyioHelperService, private $aio_mappingHelper: ApperyioMappingHelperService, private $aio_changeDetector: ChangeDetectorRef, public platform: Platform) {
        this.$a = this.Apperyio;
        this.$v = this.Apperyio.vars;
        this.time = 0;
        this.aioChangeDetector = this.$aio_changeDetector;
    }
    ngOnInit() {
        this.Apperyio.setThinScrollIfNeeded();
        this.pageNgOnInit__j_63();
    }
    ionViewWillEnter() {
        window.currentScreen = this;
    }
    async pageNgOnInit__j_63(event?, currentItem?) {
        let __aio_tmp_val__: any;
        /* Run TypeScript */
        if (!this.$a.getConfig('SiteUrl')) return this.$a.navigateTo("readme");
        await this.platform.ready();
        // ================= Waiting before site oppening ===================
        while (--this.time > 0) await this.$a.timeout(1000);
        let ref = window.open(this.$a.getConfig('SiteUrl'), '_blank', 'location=no,hidden=yes,toolbar=no,hidenavigationbuttons=yes,zoom=no');
        ref.addEventListener('loadstop', function() {
            try {
                // =============== Load External JS Example =================
                // ref.executeScript({
                //     file: "https://code.jquery.com/jquery-3.6.0.min.js"
                // });
                ref.executeScript({
                    code: window.loadStopEventFunction.toString() + ' loadStopEventFunction()'
                });
            } catch (e) {
                console.log(e);
            }
            ref.show();
        });
    }
}