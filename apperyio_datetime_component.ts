import { Component, forwardRef, ContentChild, Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonDatetime } from '@ionic/angular';
import { Subscription } from 'rxjs';

// eslint-disable-next-line no-useless-escape
const ISO_8601_REGEXP = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;
// eslint-disable-next-line no-useless-escape
const TIME_REGEXP = /^((\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/;

@Component({
    template: `
        <ion-text [class.disabled]="disabled" *ngIf="!value" class="placeholder">{{placeholder || ('Select ' + (presentation === "time" ? 'time' : 'a date'))}}</ion-text>
        <ion-text [class.disabled]="disabled" *ngIf="value">{{formatDate(value)}}</ion-text>
        <button [disabled]="disabled" class="click-button" type="button" id="open-datetime{{id}}"></button>
        <ion-modal class="aio-datetime-modal presentation-{{presentation}} style-{{showStyle}} buttons-{{hasButtons}}" trigger="open-datetime{{id}}" [keepContentsMounted]="true" (ionModalWillPresent)="onIonModalWillPresent()">
            <ng-template>
                <ion-content>
                    <ng-content></ng-content>
                </ion-content>
            </ng-template>
        </ion-modal>
    `,
    selector: 'aio-datetime',
    styles: [`
        :host {
            margin-top: var(--margin-top, 10px);
            margin-bottom: var(--margin-bottom, 9px);
            margin-left: var(--margin-start, 0px);
            margin-right: var(--margin-end, 0px);
        }
        
        :host ion-text {
            color: var(--placeholder-color);
        }
        :host ion-text.placeholder{
            opacity: var(--placeholder-opacity, 0.5);
        }
        
        :host .disabled {
            opacity: 0.3;
        }
        
        :host .click-button {
            left: 0px;
            top: 0px;
            margin: 0px;
            position: absolute;
            width: 100%;
            height: 100%;
            border: 0px;
            background: transparent;
            cursor: pointer;
            appearance: none;
            outline: none;
            z-index: 1;
        }
            
        .aio-datetime-modal {
            --border-radius: 8px;
            --width: min(350px, 100vw);
            --height: 434px;
        }
        .presentation-date {
            --height: 434px;
        }
        .presentation-date-time, .presentation-time-date {
            --height: 465px;
        }
        .aio-datetime-modal.style-wheel, .presentation-month, .presentation-month-year, .presentation-time, .presentation-year {
            --height: 255px;
        }

        .presentation-date.buttons-false {
            --height: 380px;
        }
        .presentation-date-time.buttons-false, .presentation-time-date.buttons-false {
            --height: 410px;
        }
        .aio-datetime-modal.style-wheel.buttons-false, .presentation-month.buttons-false, .presentation-month-year.buttons-false, .presentation-time.buttons-false, .presentation-year.buttons-false {
            --height: 200px;
        }
    `],
    providers: [{ 
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ApperyioDatetime),
        multi: true
    }],
})
export default class ApperyioDatetime implements ControlValueAccessor {
    @ContentChild(IonDatetime) datetimeInput!: IonDatetime ;

    value!: string | string[];
    @Input() placeholder = "";
    @Input() showStyle = "grid";
    @Input() hasButtons = "true";
    @Input() presentation = "";
    @Input() formatOptions?: Object;
    @Input() locale = "";
    @Input() disabled = false;
    @Output() ionChange = new EventEmitter<CustomEvent>();
    @Output() ionBlur = new EventEmitter();
    @Output() ionCancel = new EventEmitter<CustomEvent>();
    @Output() ionFocus = new EventEmitter<CustomEvent>();
    
    subscriptions: Subscription[] = [];
    id = Math.random().toString();

    onIonModalWillPresent() {
        this.datetimeInput.reset(Array.isArray(this.value) ? this.value[0] : this.value);
    }

    ngAfterContentInit() {
        // contentChild is set
        this.subscriptions.push(this.datetimeInput.ionChange.subscribe((e: CustomEvent) => {
            this.value = e.detail.value;
            this.onChange(this.value);
            this.ionChange.emit(e);
            e.stopPropagation();
        }));
        this.subscriptions.push(this.datetimeInput.ionBlur.subscribe(() => {
            this._onTouched();
            this.ionBlur.emit();
        }));
        this.subscriptions.push(this.datetimeInput.ionCancel.subscribe(() => {
            this.ionCancel.emit();
        }));
        this.subscriptions.push(this.datetimeInput.ionFocus.subscribe(() => {
            this.ionFocus.emit();
        }));
        if (this.datetimeInput.value) {
            setTimeout( () => {
                this.value = <any>this.datetimeInput.value;
                this.onChange(this.value);
            }, 10);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    writeValue(value: any) {
        this.value = value;
        if (this.datetimeInput) {
            this.datetimeInput.value = this.value;
        }
    }

    registerOnChange(fn: (_: any) => void) {
        this.onChange = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    onChange(_: any) {}
    _onTouched() {}
    
    private _correctDateValue(value: string): string {
        let parse;
        if (this.presentation === "time") {
            parse = TIME_REGEXP.exec(value);
            if (parse) {
                return (new Date()).toISOString().slice(0,11) + parse[2] + ":" + parse[3];
            }
        }
        parse = ISO_8601_REGEXP.exec(value);
        if (!parse) return "";
        if (!parse[4] || !parse[5]) {
            return `${parse[1]}-${parse[2]}-${parse[3]}T${parse[4] || "00"}:${parse[5] || "00"}:${parse[6] || "00"}`
        } else if(parse[8]) { // ends with Z
            return value.slice(0, -1);
        } else if(parse[9]) { // ends with (+|-)xx:xx
            return value.replace(/[\+\-]\d{2}(:\d{2})?$/, "");
        }
        return value;
    }

    formatDate(value) {
        if (!value) {
            return "";
        }
        value = this._correctDateValue(value);
        let options;
        if (!this.formatOptions) {
            switch (this.presentation) {
              case "date": 
                options = {dateStyle: "medium"};
                break;
              case "date-time":
                options = {dateStyle: "medium", timeStyle: "short"}; 
                break;
              case "month":
                options = {month: "long"};
                break;
              case "month-year":
                options = {year: "numeric", month: "long"};
                break;
              case "time":
                options = {timeStyle: "short"};
                break;
              case "time-date":
                options = {dateStyle: "medium", timeStyle: "short"}; 
                break;
              case "year":
                options = {year: "numeric"};
                break;
              default: // works like `date` by default
                options = {dateStyle: "medium"};
            }
        } else {
            options = this.formatOptions;
        }
        let res, locale;
        if (this.locale) {
            locale = this.locale;
        } else {
            try {
                locale = Intl.DateTimeFormat().resolvedOptions().locale || "en-US";
            } catch (e) {
                locale = "en-US"
            }
        }
        try {
            res = new Date(value).toLocaleString(locale, options);
        } catch (e) {
            console.log(e);
            res = value
        }
        return res;
    }
}
