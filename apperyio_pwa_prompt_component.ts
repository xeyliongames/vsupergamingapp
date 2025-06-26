import {
    Component
} from '@angular/core';
import {
    pwaInfo
} from '../../constants';

import { ApperyioHelperService } from '../apperyio_helper';
@Component({
    template: `
<ion-header mode="ios">
    <ion-toolbar mode="md" class="header-toolbar">
        <ion-title>
            <img [src]="icon" class="app-icon">
            {{'Install' | translate}} <span *ngIf="!!name">'{{name}}'</span> 
        </ion-title>
        <ion-buttons slot="end" collapse="true">
            <ion-button expand="block" color="medium" (click)="close()">
                <ion-icon name="close" slot="icon-only">
                </ion-icon>
            </ion-button>
        </ion-buttons>
    </ion-toolbar>
</ion-header>
<ion-content class="ion-padding-horizontal">
    <div class="info-text">
         {{'Install the app on your device to easily access it anytime.' | translate}}
    </div>
    <ol *ngIf="data.mobileType === 'ios'" class="steps-list">
        <li>
            {{'Tap the Menu button' | translate}} <ion-icon name="share-outline" size="large"></ion-icon>
        </li>
        <li>
            {{'Tap Add to Home Screen' | translate}} <ion-icon class="add-icon" name="add" size="large"></ion-icon>
        </li>
    </ol>
    <div *ngIf="data.mobileType === 'ios'" class="hint">
        {{'This feature is exclusively accessible in the Safari browser.' | translate}}
    </div>
</ion-content>
<ion-footer mode="ios">
    <div class="buttons-wrapper">
        <ion-button color="medium" fill="clear" strong="true" (click)="close('dismiss')">
            {{'Dismiss' | translate}}
        </ion-button>
        <ion-button *ngIf="data.mobileType === 'android'" color="primary" strong="true" (click)="installPWA()">
            {{'Install' | translate}}
        </ion-button>
        <ion-button *ngIf="data.mobileType === 'ios'" color="primary" strong="true" (click)="close()">
            {{'OK' | translate}}
        </ion-button>
    </div>
</ion-footer>
`,
    selector: 'prompt-modal-component',
    styles: [`
ion-toolbar.header-toolbar {
    --border-width: 0;
    margin: 0 10px 10px 10px;
    padding: 0;
    --background: var(--ion-background-color);
}
ion-title {
    padding: 0;
}
.buttons-wrapper {
    text-align: end;
}
.buttons-wrapper ion-button{
    min-width: 30%;
    margin: 10px;
}
.app-icon {
    width: 30px;
    margin-bottom: -6px;
    margin-right: 5px;
}
ion-icon {
    color: var(--ion-color-dark);
    margin-left: 5px;
    margin-bottom: -9px;
}
ion-icon.add-icon {
	border-style: solid;
	border-color: var(--ion-color-dark);
	border-width: 2px;
	border-radius: 2px;
    width: 24px;
    height: 24px;
}
.steps-list {
    padding: 0 0 0 16px;
    margin: 0;
}
.steps-list li {
    line-height: 32px
}
.hint {
    margin-top: 8px;
    font-size: 90%;
    color: var(--ion-color-medium);
}
`]
})
export default class PromptModalComponent {
    public data: any;
    public name = pwaInfo.name || pwaInfo.shortName; 
    public icon = pwaInfo.icon || "assets/icon/favicon.png"; 
    constructor(public Apperyio: ApperyioHelperService) {
    }
    close(dismiss?) {
        this.Apperyio.getController("ModalController").dismiss(dismiss);
    }
    installPWA() {
        this.data.promptEvent?.prompt();
        this.close();
    }
}
