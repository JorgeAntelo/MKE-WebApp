import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef } from "@angular/core";
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { DatePipe } from '@angular/common';
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-additionalpayment',
    templateUrl: './additionalpayment.component.html',
    styleUrls: ['./additionalpayment.component.css'],
    providers: []
})
export class AdditionalPaymentComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    APForm: FormGroup;
    MessageType: string;
    Message: string;
    ErrorMsg: string;
    SuccessMsg: string;
    UserId: number;
    submitted = false;
    AddBtn: string;
    // component communication
    @Input('userId')
    set userId(data: any) {
        if (data) {
            this.UserId = Number(data);
        }
    }

    ParentScreenName: string;
    @Input('parentScreenName')
    set parentScreenName(data: any) {
        if (data) {
            this.ParentScreenName = data;
            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.AddBtn = 'Add to Cart';
                    break;
                case 'Disposition':
                    this.AddBtn = 'Add to Cart';
                    break;
            }
        }
    }

    VehicleStatus: string;
    @Input('vehicleStatus')
    set vehicleStatus(data: any) {
        if (data) {
            this.VehicleStatus = String(data);
        }
    }

    subscription: Subscription;
    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        private commService: CommunicationService) {

        this.subscription = this.commService.getClearCashiering().subscribe(res => {
            if (res) {
                this.APForm.reset();
                this.ErrorMsg = this.SuccessMsg = '';
                this.submitted = false;
                const control = <FormArray>this.APForm.controls['APListArray'];
                control.controls = [];
                control.push(this.initAPInfoItem('', ''));
            }
        });

        this.subscription = this.commService.getMessage().subscribe(res => {
            if (res) {
                this.MessageType = res.data.Type;
                this.Message = res.data.Msg;
                this.ErrorMsg = this.SuccessMsg = '';
                if (this.MessageType == 'Error') {
                    this.ErrorMsg = this.Message;
                    this.SuccessMsg = '';
                }
            }
        });

        this.subscription = this.commService.getCartData().subscribe(res => {
            if (res) {
                if (typeof res.deleteCartItem.Type != 'undefined' && res.deleteCartItem.Type == 'OtherFees') {
                    this.DeletedRowsFromCart(res.deleteCartItem);
                }
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
    }

    get APListArrayformData() {
        return <FormArray>this.APForm.get('APListArray');
    }

    initForm() {
        this.APForm = this.formBuilder.group({
            APListArray: this.formBuilder.array([])
        });

        const control = <FormArray>this.APForm.controls['APListArray'];
        control.controls = [];

        control.push(this.initAPInfoItem('', ''));
    }

    initAPInfoItem(feeName, amount) {
        return this.formBuilder.group({
            feeNameFormControl: new FormControl(feeName, Validators.required),
            amountFormControl: new FormControl(amount, Validators.required)
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    resetRow(index: number) {
        let control = <FormArray>this.APForm.controls['APListArray'];
        control.controls[index].setValue({ feeNameFormControl: '', amountFormControl: '' });
    }

    AddNewRow() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = false;
        const control = <FormArray>this.APForm.controls['APListArray'];
        control.push(this.initAPInfoItem('', ''));
    }

    deleteRow(index: number) {
        const control = <FormArray>this.APForm.controls['APListArray'];
        control.controls.splice(index, 1);
        this.AddToCart();
    }

    AddToCart() {
        // console.log('AddToCart');
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.APForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let apModel: CashieringAPModel = new CashieringAPModel();
        let dmvList = [];
        const control = <FormArray>this.APForm.controls['APListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let apDetailsModel: CashieringAPDetailsModel = new CashieringAPDetailsModel();

            apDetailsModel.feeName = element.feeNameFormControl;
            apDetailsModel.amount = element.amountFormControl;
            apDetailsModel.userId = this.UserId;
            apDetailsModel.Description = element.feeNameFormControl;
            dmvList.push(apDetailsModel);
            // console.log(apDetailsModel);
        }
        apModel.APDetailsList = dmvList;
        if (apModel.APDetailsList.length > 0) {
            let apData = {
                'totalofAP': this.getSum(),
                'apModel': apModel
            }

            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.commService.sendAPData(apData);
                    this.SuccessMsg = 'Added to cart';
                    setTimeout(() => {                        
                        this.SuccessMsg = this.ErrorMsg = '';
                    }, 3000);
                    break;
                case 'Disposition':
                    this.commService.sendAPDataToDisposition(apData);

                    if (this.MessageType == 'Error') {
                        this.ErrorMsg = this.Message;                        
                        this.SuccessMsg = this.ErrorMsg = '';
                    }
                    else {
                        this.SuccessMsg = 'Added to cart';
                        setTimeout(() => {
                            this.SuccessMsg = this.ErrorMsg = '';
                        }, 3000);
                    }
                    break;
            }
        } else {
            this.ErrorMsg = 'Error occured while adding to cart';
            setTimeout(() => {
                this.SuccessMsg = this.ErrorMsg = '';
            }, 3000);
        }
    }

    getSum() {
        let sum = 0;
        const control = <FormArray>this.APForm.controls['APListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            if (element.amountFormControl) {
                sum += Number(element.amountFormControl);
            } else {
                sum += Number(0);
            }
        }
        return sum;
    }

    integerOnly(event) {
        const e = <KeyboardEvent>event;
        if (e.key === 'Tab' || e.key === 'TAB') {
            return;
        }
        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A
            //(e.keyCode === 65 && e.ctrlKey === true) ||
            // Allow: Ctrl+C
            //(e.keyCode === 67 && e.ctrlKey === true) ||
            // Allow: Ctrl+V
            //(e.keyCode === 86 && e.ctrlKey === true) ||
            // Allow: Ctrl+X
            (e.keyCode === 88 && e.ctrlKey === true)) {
            // let it happen, don't do anything
            return;
        }
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
            e.preventDefault();
        }
    }

    getdmvArray(form): Array<any> {
        return form.controls.APListArray.controls;
    }

    findDuplicate(feeName, index): boolean {
        const control = <FormArray>this.APForm.controls['APListArray'];
        let myArray = this.getdmvArray(this.APForm);
        let test = myArray.filter(data => data.controls.feeNameFormControl.value == feeName && feeName != null)

        if (test.length > 1) {
            this.APForm.controls['APListArray']['controls'][index].get('feeNameFormControl').setErrors({ 'duplicate': true });
            return true;
        } else {
            this.APForm.controls['APListArray']['controls'][index].get('feeNameFormControl').setErrors(null);
            return false
        }
    }

    DeletedRowsFromCart(deleteCartItem) {
        const control = <FormArray>this.APForm.controls['APListArray'];
        if (control.controls.length > 1) {
            (<FormArray>this.APForm.controls['APListArray']).removeAt(this.APForm.controls['APListArray'].value.findIndex(item => (item.feeNameFormControl).includes(deleteCartItem.Description)));
            let summeryData = {
                'totalofAP': this.getSum()
            }
            this.commService.sendSummeryData(summeryData);
        } else {
            let index = this.APForm.controls['APListArray'].value.findIndex(item => (item.feeNameFormControl).includes(deleteCartItem.Description))
            if (index != -1) {
                this.resetRow(0);
                this.submitted = false;

                let summeryData = {
                    'totalofAP': this.getSum()
                }

                this.commService.sendSummeryData(summeryData);
                let apModel: CashieringAPModel = new CashieringAPModel();
                apModel.APDetailsList = [];
                let DVMData = {
                    'apModel': apModel
                }
                this.commService.sendCartAPData(DVMData);
            }
        }
    }
}

class CashieringAPModel {
    APDetailsList: CashieringAPDetailsModel[];
}

class CashieringAPDetailsModel {
    APId: number;
    feeName: any;
    amount: number;
    userId: number;
    Description: string;
}