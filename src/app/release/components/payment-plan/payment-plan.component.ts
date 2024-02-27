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
    selector: 'app-payment-plan',
    templateUrl: './payment-plan.component.html',
    styleUrls: ['./payment-plan.component.css'],
    providers: []
})
export class PaymentPlanComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    PaymentPlanForm: FormGroup;
    StateList = [];
    defaultState = Global.DefaultState;
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
                this.PaymentPlanForm.reset();
                this.ErrorMsg = this.SuccessMsg = '';
                this.submitted = false;
                const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
                control.controls = [];
                control.push(this.initPaymentPlanInfoItem('', ''));
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
                if (typeof res.deleteCartItem.Type != 'undefined' && res.deleteCartItem.Type == 'PaymentPlan') {
                    this.DeletedRowsFromCart(res.deleteCartItem);
                }
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
    }

    get paymentPlanListArrayformData() {
        return <FormArray>this.PaymentPlanForm.get('paymentPlanListArray');
    }

    initForm() {
        this.PaymentPlanForm = this.formBuilder.group({
            paymentPlanListArray: this.formBuilder.array([])
        });

        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        control.controls = [];

        control.push(this.initPaymentPlanInfoItem('', ''));
    }

    initPaymentPlanInfoItem(paymentPlanNo, amount) {
        return this.formBuilder.group({
            paymentPlanNoFormControl: new FormControl(paymentPlanNo, Validators.required),
            amountFormControl: new FormControl(amount, Validators.required)
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    resetRow(index: number) {
        let control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        control.controls[index].setValue({ paymentPlanNoFormControl: '', amountFormControl: '' });
    }

    AddNewRow() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = false;
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        control.push(this.initPaymentPlanInfoItem('', ''));
    }

    deleteRow(index: number) {
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        control.controls.splice(index, 1);
        this.AddToCart();
    }

    AddToCart() {
        // console.log('AddToCart');
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.PaymentPlanForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let paymentPlanModel: CashieringPaymentPlanModel = new CashieringPaymentPlanModel();
        let paymentPlanList = [];
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let paymentPlanDetailsModel: CashieringPaymentPlanDetailsModel = new CashieringPaymentPlanDetailsModel();

            paymentPlanDetailsModel.paymentPlanNo = element.paymentPlanNoFormControl;
            paymentPlanDetailsModel.amount = element.amountFormControl;
            paymentPlanDetailsModel.userId = this.UserId;            
            paymentPlanDetailsModel.Description = 'Fleet Payment - ' + element.paymentPlanNoFormControl;
            paymentPlanList.push(paymentPlanDetailsModel);
            this.SaveAddtoCart(element.paymentPlanNoFormControl, element.amountFormControl)
        }
        paymentPlanModel.PaymentPlanDetailsList = paymentPlanList;
        if (paymentPlanModel.PaymentPlanDetailsList.length > 0) {
            let dmvData = {
                'totalofPaymentPlan': this.getSum(),
                'paymentPlanModel': paymentPlanModel
            }

            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.commService.sendPaymentPlanData(dmvData);
                    this.SuccessMsg = 'Added to cart';
                    setTimeout(() => {
                        this.SuccessMsg = this.ErrorMsg = '';
                    }, 3000);
                    break;
                case 'Disposition':
                    this.commService.sendPaymentPlanDataToDisposition(dmvData);

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

    SaveAddtoCart(paymentPlanNo, Amount) {
        let ReferenceId = this.ParentScreenName == 'Disposition' ?localStorage.getItem('TowId'):localStorage.getItem('CashierSequenceNo');
        let model: AddToCart = {
            LicensePlate: '',
            Permit: '',
            PaymentPlan: paymentPlanNo,
            FeeName: '',
            CitationNo: '',
            State: '',
            Amount: Amount,
            CartType: 'PaymentPlan',
            ReferenceId: ReferenceId,
            UserId: this.UserId
        }
        this._dataService
            .post(Global.DLMS_API_URL + 'api/Disposition/SaveAddToCartItem', model)
            .subscribe(response => {
                if (response.Code > 0) { }
            });
    }

    getSum() {
        let sum = 0;
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
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

    getPaymentPlanArray(form): Array<any> {
        return form.controls.paymentPlanListArray.controls;
    }

    findDuplicate(paymentPlanNo, index): boolean {
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        const element = control.controls[index].value;
        let myArray = this.getPaymentPlanArray(this.PaymentPlanForm);
        let test = myArray.filter(data => data.controls.paymentPlanNoFormControl.value == paymentPlanNo && paymentPlanNo != null)

        if (test.length > 1) {
            this.PaymentPlanForm.controls['paymentPlanListArray']['controls'][index].get('paymentPlanNoFormControl').setErrors({ 'duplicate': true });
            return true;
        } else {
            this.PaymentPlanForm.controls['paymentPlanListArray']['controls'][index].get('paymentPlanNoFormControl').setErrors(null);
            return false
        }
    }

    DeletedRowsFromCart(deleteCartItem) {
        const control = <FormArray>this.PaymentPlanForm.controls['paymentPlanListArray'];
        if (control.controls.length > 1) {
            (<FormArray>this.PaymentPlanForm.controls['paymentPlanListArray']).removeAt(this.PaymentPlanForm.controls['paymentPlanListArray'].value.findIndex(item => (item.paymentPlanNoFormControl).includes(deleteCartItem.Description)));
            let summeryData = {
                'totalofPaymentPlan': this.getSum()
            }
            this.commService.sendSummeryData(summeryData);
        } else {
            let index = this.PaymentPlanForm.controls['paymentPlanListArray'].value.findIndex(item => (item.paymentPlanNoFormControl).includes(deleteCartItem.Description))
            if (index != -1) {
                this.resetRow(0);
                this.submitted = false;

                let summeryData = {
                    'totalofPaymentPlan': this.getSum()
                }

                this.commService.sendSummeryData(summeryData);
                let paymentPlanModel: CashieringPaymentPlanModel = new CashieringPaymentPlanModel();
                paymentPlanModel.PaymentPlanDetailsList = [];
                let PaymentPlanData = {
                    'totalofPaymentPlan': this.getSum(),
                    'paymentPlanModel': paymentPlanModel
                }
                this.commService.sendPaymentPlanData(PaymentPlanData);
            }
        }
    }
}

class CashieringPaymentPlanModel {
    PaymentPlanDetailsList: CashieringPaymentPlanDetailsModel[];
}

class CashieringPaymentPlanDetailsModel {
    PaymentPlanId: number;
    paymentPlanNo: any;
    amount: number;
    userId: number;
    Description: string;
}