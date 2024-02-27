import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';

@Component({
    selector: 'app-multi-card-payment',
    templateUrl: './multi-card-payment.component.html',
    styleUrls: ['./multi-card-payment.component.css']
})
export class MultiCardPaymentComponent implements OnInit {

    DMVForm: FormGroup;
    StateList = [];
    MessageType: string;
    Message: string;
    ErrorMsg: string;
    SuccessMsg: string;
    submitted = false;
    AddBtn: string;
    FeeGrid: any;
    HasRecords: boolean;
    DataList: any = [];
    @Input() UserId?: number = 0;
    @Input() TowId?: number = 0;
    @Input() RecordId?: any = '';
    @Input() TotalAmount?: number = 0;
    @Input() ParentScreenName?: string = '';

    PaymentForm: FormGroup;
    loading: boolean;
    DueAmount: number;
    ReferenceId: string;
    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        public utilService: UtilService,
        public communiService: CommunicationService) {
        this.ReferenceId = localStorage.getItem('CashierSequenceNo');
    }

    ngOnInit(): void {
        this.initForm();
        this.LoadList();
        this.DueAmount = this.TotalAmount;
    }

    LoadList(): void {
        this.ErrorMsg = "";
        this.SuccessMsg = "";


        if (this.ParentScreenName == 'Cashiering') {
            this.RecordId = 0;
            if (!this.ReferenceId) {
                this.ReferenceId = '';
            }
        } else {
            this.ReferenceId = '';
            if (!this.RecordId) {
                this.RecordId = 0;
            }
        }


        this._dataService.get(Global.DLMS_API_URL + `api/Cashiering/SelectMultiCardPayment?RecordId=${this.RecordId}&ReferenceId=${this.ReferenceId}`)
            .subscribe(items => {
                if (items != null) {
                    this.DataList = items;
                }
                else {
                    this.DataList = [];
                }
            },
                error => {
                    this.ErrorMsg = <any>error
                });
    }

    initForm() {
        this.PaymentForm = this.formBuilder.group({
            AmountFormControl: ['', Validators.compose([Validators.required])]
        });
    }

    getSum() {
        this.DueAmount = 0;
        let sum = 0;
        for (let index = 0; index < this.DataList.length; index++) {
            const element = this.DataList[index].TotalAmount;
            if (element) {
                sum += Number(element);
            } else {
                sum += Number(0);
            }
        }
        let enterAmount: number = this.PaymentForm.controls.AmountFormControl.value == "" ? 0 : this.PaymentForm.controls.AmountFormControl.value;
        this.DueAmount = (Number(this.TotalAmount) - Number(sum)) - enterAmount;
        return Number(this.DueAmount.toFixed(2));
    }

    onBlurDueAmount() {
        let enterAmount: number = this.PaymentForm.controls.AmountFormControl.value == "" ? 0 : this.PaymentForm.controls.AmountFormControl.value;
        let dueAmount = Number(this.TotalAmount) - enterAmount;
        this.DueAmount = Number(dueAmount.toFixed(2));
        this.getSum();
    }

    integerOnly(event) {
        const e = <KeyboardEvent>event;
        if (e.key === 'Tab' || e.key === 'TAB') {
            return;
        }
        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }

    async onSubmit(obj) {
        this.loading = true;
        this.SuccessMsg = '';
        this.ErrorMsg = '';
        let model: any = {
            UserId: this.UserId,
            RecordId: this.RecordId,
            Amount: obj.AmountFormControl
        }
        const hsn = localStorage.getItem('hsn');
        if (hsn) {
            model.HSN = hsn;
        }

        if (this.ParentScreenName == 'Cashiering') {
            if (this.ReferenceId) {
                model.ReferenceId = this.ReferenceId;
            }
        }

        this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SaveMultiCardPayment', model).subscribe(response => {
            if (response.Id > 0) {
                this.SuccessMsg = response.Result;
                this.loading = false;
                this.communiService.sendCreditCardAutoFillData(true);
                this.PaymentForm.reset();
                this.LoadList();
            } else {
                this.ErrorMsg = response.Result;
                this.loading = false;
            }
        },
            error => {
                this.ErrorMsg = <any>error;
                this.loading = false;
            });
    }

    close() {
        this.communiService.sendCreditCardAutoFillData(true);
        this._dataService.modalPromptDetailsRef.hide();
    }
}
