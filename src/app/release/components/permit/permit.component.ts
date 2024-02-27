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
    selector: 'app-permit',
    templateUrl: './permit.component.html',
    styleUrls: ['./permit.component.css'],
    providers: []
})
export class PermitComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    PermitForm: FormGroup;
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
                this.PermitForm.reset();
                this.ErrorMsg = this.SuccessMsg = '';
                this.submitted = false;
                const control = <FormArray>this.PermitForm.controls['permitListArray'];
                control.controls = [];
                control.push(this.initPermitInfoItem('', ''));
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
                if (typeof res.deleteCartItem.Type != 'undefined' && res.deleteCartItem.Type == 'Permit') {
                    this.DeletedRowsFromCart(res.deleteCartItem);
                }
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
    }

    get permitListArrayformData() {
        return <FormArray>this.PermitForm.get('permitListArray');
    }

    initForm() {
        this.PermitForm = this.formBuilder.group({
            permitListArray: this.formBuilder.array([])
        });

        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        control.controls = [];

        control.push(this.initPermitInfoItem('', ''));
    }

    initPermitInfoItem(permitNo, amount) {
        return this.formBuilder.group({
            permitNoFormControl: new FormControl(permitNo, Validators.required),
            amountFormControl: new FormControl(amount, Validators.required)
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    resetRow(index: number) {
        let control = <FormArray>this.PermitForm.controls['permitListArray'];
        control.controls[index].setValue({ permitNoFormControl: '', amountFormControl: '' });
    }

    AddNewRow() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = false;
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        control.push(this.initPermitInfoItem('', ''));
    }

    deleteRow(index: number) {
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        control.controls.splice(index, 1);
        this.AddToCart();
    }

    AddToCart() {
        // console.log('AddToCart');
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.PermitForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let permitModel: CashieringPermitModel = new CashieringPermitModel();
        let permitList = [];
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let permitDetailsModel: CashieringPermitDetailsModel = new CashieringPermitDetailsModel();

            permitDetailsModel.permitNo = element.permitNoFormControl;
            permitDetailsModel.amount = element.amountFormControl;
            permitDetailsModel.userId = this.UserId;
            permitDetailsModel.Description = 'Permits - ' + element.permitNoFormControl;
            permitList.push(permitDetailsModel);
            // console.log(permitDetailsModel);
            this.SaveAddtoCart(element.permitNoFormControl,element.amountFormControl);
        }
        permitModel.PermitDetailsList = permitList;
        if (permitModel.PermitDetailsList.length > 0) {
            let permitData = {
                'totalofPermits': this.getSum(),
                'permitModel': permitModel
            }

            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.commService.sendPermitsData(permitData);
                    this.SuccessMsg = 'Added to cart';
                    setTimeout(() => {
                        this.SuccessMsg = this.ErrorMsg = '';
                    }, 3000);
                    break;
                case 'Disposition':
                    this.commService.sendPermitsDataToDisposition(permitData);

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

    SaveAddtoCart(permitNo, Amount) {
        let ReferenceId = this.ParentScreenName == 'Disposition' ?localStorage.getItem('TowId'):localStorage.getItem('CashierSequenceNo');
        let model: AddToCart = {
            LicensePlate: '',
            Permit: permitNo,
            PaymentPlan: '',
            FeeName: '',
            CitationNo: '',
            State: '',
            Amount: Amount,
            CartType: 'Permit',
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
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
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

    getPermitArray(form): Array<any> {
        return form.controls.permitListArray.controls;
    }

    findDuplicate(permitNo, index): boolean {
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        const element = control.controls[index].value;
        let myArray = this.getPermitArray(this.PermitForm);
        let test = myArray.filter(data => data.controls.permitNoFormControl.value == permitNo && permitNo != null)

        if (test.length > 1) {
            this.PermitForm.controls['permitListArray']['controls'][index].get('permitNoFormControl').setErrors({ 'duplicate': true });
            return true;
        } else {
            this.PermitForm.controls['permitListArray']['controls'][index].get('permitNoFormControl').setErrors(null);
            return false
        }
    }

    DeletedRowsFromCart(deleteCartItem) {
        const control = <FormArray>this.PermitForm.controls['permitListArray'];
        if (control.controls.length > 1) {
            (<FormArray>this.PermitForm.controls['permitListArray']).removeAt(this.PermitForm.controls['permitListArray'].value.findIndex(item => (item.permitNoFormControl).includes(deleteCartItem.Description)));
            let summeryData = {
                'totalofPermits': this.getSum()
            }
            this.commService.sendSummeryData(summeryData);
        } else {
            let index = this.PermitForm.controls['permitListArray'].value.findIndex(item => (item.permitNoFormControl).includes(deleteCartItem.Description))
            if (index != -1) {
                this.resetRow(0);
                this.submitted = false;

                let summeryData = {
                    'totalofPermits': this.getSum()
                }

                this.commService.sendSummeryData(summeryData);
                let permitModel: CashieringPermitModel = new CashieringPermitModel();
                permitModel.PermitDetailsList = [];
                let PermitData = {
                    'totalofPermits': this.getSum(),
                    'permitModel': permitModel
                }
                this.commService.sendPermitsData(PermitData);
            }
        }
    }
}

class CashieringPermitModel {
    PermitDetailsList: CashieringPermitDetailsModel[];
}

class CashieringPermitDetailsModel {
    PermitId: number;
    permitNo: any;
    amount: number;
    userId: number;
    Description: string;
}