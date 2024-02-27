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
    selector: 'app-dmv',
    templateUrl: './dmv.component.html',
    styleUrls: ['./dmv.component.css'],
    providers: []
})
export class DMVComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    DMVForm: FormGroup;
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
                this.DMVForm.reset();
                this.ErrorMsg = this.SuccessMsg = '';
                this.submitted = false;
                const control = <FormArray>this.DMVForm.controls['dmvListArray'];
                control.controls = [];
                control.push(this.initDMVInfoItem('', '', ''));

                this.loadDropdowns();
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
                if (typeof res.deleteCartItem.Type != 'undefined' && res.deleteCartItem.Type == 'DMV') {
                    this.DeletedRowsFromCart(res.deleteCartItem);
                }
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.loadDropdowns();
    }

    get dmvListArrayformData() {
        return <FormArray>this.DMVForm.get('dmvListArray');
    }

    initForm() {
        this.DMVForm = this.formBuilder.group({
            dmvListArray: this.formBuilder.array([])
        });

        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        control.controls = [];

        control.push(this.initDMVInfoItem('', '', ''));
    }

    initDMVInfoItem(licensePlate, state, amount) {
        return this.formBuilder.group({
            licensePlateFormControl: new FormControl(licensePlate, Validators.required),
            stateFormControl: new FormControl(state, Validators.required),
            amountFormControl: new FormControl(amount, Validators.required)
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    loadDropdowns() {
        this.loadState(0, 0);
    }

    loadState(StateId, index) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
            .subscribe(states => {
                this.StateList = states;
                if (StateId > 0) {
                    for (let obj of this.StateList[index]) {
                        if (StateId == obj.StateId) {
                            this.DMVForm.controls.dmvListArray['controls'][index].controls['stateFormControl'].setValue(obj, {});
                        }
                    }
                }
                else {
                    let data = this.StateList.filter(x => x.State_Code == this.defaultState);
                    this.DMVForm.controls.dmvListArray['controls'][index].controls['stateFormControl'].setValue(data[0], {});
                }
            },
                error => this.ErrorMsg = <any>error);
    }
    resetRow(index: number) {
        let data = this.StateList.filter(x => x.State_Code == this.defaultState);
        let control = <FormArray>this.DMVForm.controls['dmvListArray'];
        control.controls[index].setValue({ licensePlateFormControl: '', stateFormControl: data[0], amountFormControl: '' });
    }

    AddNewRow() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = false;
        let data = this.StateList.filter(x => x.State_Code == this.defaultState);
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        control.push(this.initDMVInfoItem('', data[0], ''));
    }

    deleteRow(index: number) {
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        control.controls.splice(index, 1);
        this.AddToCart();
    }

    AddToCart() {
        // console.log('AddToCart');
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        // reset alerts on submit
        // stop here if form is invalid
        if (this.DMVForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            return;
        }

        let dmvModel: CashieringDMVModel = new CashieringDMVModel();
        let dmvList = [];
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        for (let index = 0; index < control.length; index++) {
            //const element = control[index];     
            const element = control.controls[index].value;
            let dmvDetailsModel: CashieringDMVDetailsModel = new CashieringDMVDetailsModel();

            dmvDetailsModel.licensePlate = element.licensePlateFormControl;
            dmvDetailsModel.stateId = element.stateFormControl.StateId;
            dmvDetailsModel.amount = element.amountFormControl;
            dmvDetailsModel.userId = this.UserId;
            dmvDetailsModel.Description = 'DMV - ' + element.licensePlateFormControl;
            dmvList.push(dmvDetailsModel);
            // console.log(dmvDetailsModel);
            this.SaveAddtoCart(element.licensePlateFormControl, element.stateFormControl.StateId, element.amountFormControl);
        }
        dmvModel.DMVDetailsList = dmvList;
        if (dmvModel.DMVDetailsList.length > 0) {
            let dmvData = {
                'totalofDMV': this.getSum(),
                'dmvModel': dmvModel
            }

            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.commService.sendDMVData(dmvData);
                    this.SuccessMsg = 'Added to cart';
                    setTimeout(() => {
                        this.SuccessMsg = this.ErrorMsg = '';
                    }, 3000);
                    break;
                case 'Disposition':
                    this.commService.sendDMVDataToDisposition(dmvData);

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

    SaveAddtoCart(LicensePlate, State, Amount) {
        let ReferenceId = this.ParentScreenName == 'Disposition' ?localStorage.getItem('TowId'):localStorage.getItem('CashierSequenceNo');
        let model: AddToCart = {
            LicensePlate: LicensePlate,
            Permit: '',
            PaymentPlan: '',
            FeeName: '',
            CitationNo: '',
            State: State,
            Amount: Amount,
            CartType: 'DMV',
            ReferenceId: ReferenceId,
            UserId: this.userId
        }
        this._dataService
            .post(Global.DLMS_API_URL + 'api/Disposition/SaveAddToCartItem', model)
            .subscribe(response => {
                if (response.Code > 0) { }
            });
    }

    getSum() {
        let sum = 0;
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
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
        return form.controls.dmvListArray.controls;
    }

    findDuplicate(licensePlate, index): boolean {
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        const element = control.controls[index].value;
        let myArray = this.getdmvArray(this.DMVForm);
        let test = myArray.filter(data => data.controls.licensePlateFormControl.value == licensePlate && licensePlate != null &&
            data.controls.stateFormControl.value.State_Code == element.stateFormControl.State_Code && element.stateFormControl != null)

        if (test.length > 1) {
            this.DMVForm.controls['dmvListArray']['controls'][index].get('licensePlateFormControl').setErrors({ 'duplicate': true });
            return true;
        } else {
            this.DMVForm.controls['dmvListArray']['controls'][index].get('licensePlateFormControl').setErrors(null);
            return false
        }
    }

    DeletedRowsFromCart(deleteCartItem) {
        const control = <FormArray>this.DMVForm.controls['dmvListArray'];
        if (control.controls.length > 1) {
            (<FormArray>this.DMVForm.controls['dmvListArray']).removeAt(this.DMVForm.controls['dmvListArray'].value.findIndex(item => (item.licensePlateFormControl + ' ' + item.stateFormControl.State_Code).includes(deleteCartItem.Description)));
            let summeryData = {
                'totalofDMV': this.getSum()
            }
            this.commService.sendSummeryData(summeryData);
        } else {
            let index = this.DMVForm.controls['dmvListArray'].value.findIndex(item => (item.licensePlateFormControl + ' ' + item.stateFormControl.State_Code).includes(deleteCartItem.Description))
            if (index != -1) {
                this.resetRow(0);
                this.submitted = false;

                let summeryData = {
                    'totalofDMV': this.getSum()
                }

                this.commService.sendSummeryData(summeryData);
                let dmvModel: CashieringDMVModel = new CashieringDMVModel();
                dmvModel.DMVDetailsList = [];
                let DVMData = {
                    'totalofDMV': this.getSum(),
                    'dmvModel': dmvModel
                }
                this.commService.sendDMVData(DVMData);
            }
        }
    }
}

class CashieringDMVModel {
    DMVDetailsList: CashieringDMVDetailsModel[];
}

class CashieringDMVDetailsModel {
    DMVId: number;
    licensePlate: any;
    stateId: number;
    amount: number;
    userId: number;
    Description: string;
}