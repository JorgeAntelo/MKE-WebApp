import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { DatePipe } from '@angular/common';
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";
import signature from '../../../../assets/js/signature';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ConfirmModalComponent } from "src/app/confirm-modal/confirm-modal.component";
declare var $: any

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css'],
    providers: []
})
export class PaymentComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild('templateSignature') modalSignatureRef: BsModalRef;
    @ViewChild('templateCompany') modaltemplateCompanyRef: BsModalRef;
    @ViewChild('templateConfirmClover') modaltemplateConfirmClover: BsModalRef;
    //@ViewChild('templateConfirmClover') public templateConfirmClover: TemplateRef<any>;
    
    towCompanyURL: any;
    connectURL: any;
    urlCache = new Map<string, SafeResourceUrl>();
    phonemask: any[] = Global.phonemask;
    permitInfoList = [];
    MainReleaseToList = [];
    ReleaseToList = [];
    CompanyList = [];
    ReleaseToNameList = [];
    showNameText = false;
    isAdministrativeRelease = false;
    isTowCompanyRelease = false;
    PermitId = 0;
    CitationId: number;
    DMVID: number;
    PaymentPlanId: number;
    permitIndex: number;
    submitted = false;
    submittedPopup = false;
    isPaymentSuccess = false;
    IsCheckedRefused = false;
    PaymentForm: FormGroup;
    ErrorMsg: string;
    SuccessMsg: string;
    UserId: number;
    CIDataList = [];
    DMVDetailsList = [];
    PermitDetailsList = [];
    PaymentPlanDetailsList = [];
    APDetailsList = [];
    FeesList = [];
    PermitDetailsId: number;
    ReceiptNo: string;
    ChangeAmt = 0;
    TotalPaymentAmout = 0;
    PaymentDue = 0;
    radioSelected = 'CreditCard';
    tabName: string;
    serviceCitationsData: any;
    servicePermitsData: any;
    servicePaymentPlanData: any;
    serviceDMVData: any;
    serviceAPData: any;
    serviceFeesTabData: any;
    subscription: Subscription;
    dmvCount = 0;
    permitCount = 0;
    totalofCitations = 0;
    totalofPermits = 0;
    totalofPaymentPlan = 0;
    totalofDMV = 0;
    totalofAP = 0;
    totalofTowingFee = 0;
    PaymentId = 0;
    SelectedTowCompanyid: number = null;
    SelectedTowCompany: string = null;
    CartList: any[];
    sum: number;
    StateList: any;
    loading: boolean;
    IsCheckedRemovePlates: boolean;
    ProfileId: any;
    @ViewChild('templateDevicePrompt') public templateDevicePrompt: TemplateRef<any>;
    
    // @ViewChild('templateMultiCard') public templateMultiCard: TemplateRef<any>;

    CloverKeys: any;
    SuccessMessage: any;
    ErrorMessage: any;
    connecting: boolean;
    IsMultiCardPayment: boolean = false;
    SplitCardDueAmount: number = 0;
    CashierSequenceNo: any;
    IsVirtualPayment: boolean = false;
    IframeSrc: SafeResourceUrl;
    PaymentProfileList = [];
    ProfileCreditCardNumber: any;
    authorizeAmount: any = 0;
    disablePaymentProfile: boolean = false;
    autoSelectSingleOption: boolean = true;
    IsProfilePayment: boolean = false;
    PaymentSource: any;
    @Input('userId')
    set userId(data: any) {
        if (data) {
            this.UserId = Number(data);
        }
    }
    TowId: number;
    @Input('towId')
    set towId(data: any) {
        if (data) {
            this.TowId = Number(data);
        }
    }

    ParentScreenName: string;

    @Input('parentScreenName')
    set parentScreenName(data: any) {
        if (data) {
            this.ParentScreenName = data;
            if (this.ParentScreenName == 'Cashiering') {
                this.LoadCasheirSequence();
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

    ReleaseToInsurance: string;
    @Input('ReleaseToInsurance')
    set releaseToInsurance(data: any) {
        if (data) {
            this.ReleaseToInsurance = String(data);
            // this.ReleaseToList = this.MainReleaseToList.filter(x => x.ReleasedTo == 'No Tow');
        }
        else {
            // this.ReleaseToList = this.MainReleaseToList.filter(x => x.ReleasedTo != 'No Tow');
        }
    }
    @ViewChild('txtRefNo') txtRefNo: ElementRef;
    @ViewChild('txtCheckNo') txtCheckNo: ElementRef;

    HSN: any = 0;
    @Input('HSN')
    set hsn(data: any) {
        if (data) {
            this.HSN = data;
        }
    }
    IsCloverRadioButtonEnable: any = 0;
    @Input('IsCloverRadioButtonEnable')
    set cloverRadioButtonEnable(data: any) {
        if (data) {
            this.IsCloverRadioButtonEnable = data;
        }
    }

    IsOnlinePayment: any = 0;
    @Input('IsOnlinePaid')
    set IsOnlinePaid(data: any) {
        if (data) {
            this.IsOnlinePayment = data;
        }
    }
    @Input('RecordId') RecordId: any = 0;

    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        private datePipe: DatePipe,
        private commService: CommunicationService,
        public sanitizer: DomSanitizer) {

        this.subscription = this.commService.getCitationsData().subscribe(res => {
            if (res) {
                this.serviceCitationsData = res.citations;
                this.totalofCitations = res.citations.totalofCitations;
                this.CIDataList = res.citations.CIData;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan;
                this.PaymentForm.reset();
                let data = {
                    'ChangeAmt': 0,
                    'PaymentDue': this.PaymentDue,
                    'TotalPaymentAmout': this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan,
                    'ReceiptNo': '',
                    'PermitId': null,
                    'ApplicationNo': '',
                    'PaymentId': null
                }
                this.commService.sendPaymentCartData(data);
                this.LoadCart('Citation');
            }
        });

        this.subscription = this.commService.getCitationsDataDisposition().subscribe(res => {
            if (res) {
                this.serviceCitationsData = res.citations;
                this.totalofCitations = res.citations.totalofCitations;
                this.CIDataList = res.citations.CIData;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofTowingFee + this.totalofAP + this.totalofPaymentPlan;
                this.onCheckChange(null);
            }
        });

        this.subscription = this.commService.getPermitsData().subscribe(res => {
            if (res) {
                this.servicePermitsData = res.permits;
                this.PermitDetailsList = res.permits.permitModel.PermitDetailsList;
                this.totalofPermits = res.permits.totalofPermits;
                this.PaymentDue = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan;
                this.PaymentForm.reset();
                this.CheckConnection();
                let data = {
                    'ChangeAmt': 0,
                    'PaymentDue': this.PaymentDue,
                    'TotalPaymentAmout': this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan,
                    'ReceiptNo': '',
                    'PermitId': null,
                    'ApplicationNo': '',
                    'PaymentId': null
                }
                this.commService.sendPaymentCartData(data);
                this.LoadCart('Permits');
            }
        });

        this.subscription = this.commService.getPaymentPlanData().subscribe(res => {
            if (res) {
                this.servicePaymentPlanData = res.paymentPlan;
                this.PaymentPlanDetailsList = res.paymentPlan.paymentPlanModel.PaymentPlanDetailsList;
                this.totalofPaymentPlan = res.paymentPlan.totalofPaymentPlan;
                this.PaymentDue = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan;
                this.PaymentForm.reset();
                this.CheckConnection();
                let data = {
                    'ChangeAmt': 0,
                    'PaymentDue': this.PaymentDue,
                    'TotalPaymentAmout': this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan,
                    'ReceiptNo': '',
                    'PermitId': null,
                    'ApplicationNo': '',
                    'PaymentId': null
                }
                this.commService.sendPaymentPlanCartData(data);
                this.LoadCart('PaymentPlan');
            }
        });

        this.subscription = this.commService.getDMVData().subscribe(res => {
            if (res) {
                this.serviceDMVData = res.dmv;
                this.DMVDetailsList = res.dmv.dmvModel.DMVDetailsList;
                this.totalofDMV = res.dmv.totalofDMV;
                this.PaymentForm.reset();
                this.CheckConnection();
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan;
                let data = {
                    'ChangeAmt': 0,
                    'PaymentDue': this.PaymentDue,
                    'TotalPaymentAmout': this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan,
                    'ReceiptNo': '',
                    'PermitId': null,
                    'ApplicationNo': '',
                    'PaymentId': null
                }
                this.commService.sendPaymentCartData(data);
                this.LoadCart('DMV');
                this.onCheckChange(null);
            }
        });

        this.subscription = this.commService.getDMVDataDisposition().subscribe(res => {
            if (res) {
                this.serviceDMVData = res.dmv;
                this.DMVDetailsList = res.dmv.dmvModel.DMVDetailsList;
                this.totalofDMV = res.dmv.totalofDMV;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofTowingFee + this.totalofAP + this.totalofPaymentPlan;
                this.onCheckChange(null);
            }
        });

        this.subscription = this.commService.getAPDataDisposition().subscribe(res => {
            if (res) {
                this.serviceAPData = res.ap;
                this.APDetailsList = res.ap.apModel.APDetailsList;
                this.totalofAP = res.ap.totalofAP;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofTowingFee + this.totalofAP + this.totalofPaymentPlan;
            }
        });

        this.subscription = this.commService.getAPData().subscribe(res => {
            if (res) {
                this.serviceAPData = res.ap;
                this.APDetailsList = res.ap.apModel.APDetailsList;
                this.totalofAP = res.ap.totalofAP;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofTowingFee + this.totalofAP + this.totalofPermits + this.totalofPaymentPlan;
                let data = {
                    'ChangeAmt': 0,
                    'PaymentDue': this.PaymentDue,
                    'TotalPaymentAmout': this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan,
                    'ReceiptNo': '',
                    'PermitId': null,
                    'ApplicationNo': '',
                    'PaymentId': null
                }
                this.commService.sendPaymentCartData(data);
                this.LoadCart('OtherFees');
            }
        });

        this.subscription = this.commService.getFeesTabDataDisposition().subscribe(res => {
            if (res) {
                this.serviceFeesTabData = res.fees;
                if (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released') {
                    this.totalofTowingFee = res.fees.totalofTowingFee;
                } else {
                    this.totalofTowingFee = 0;
                }
                this.totalofCitations = res.fees.totalofCitations;
                this.totalofDMV = res.fees.totalofDMV;
                this.FeesList = res.fees.FeesList;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofTowingFee + this.totalofAP + this.totalofPaymentPlan;
            }
        });

        this.subscription = this.commService.getCartCitationData().subscribe(res => {
            if (res) {
                this.CIDataList = res.citations.CIData;
                this.PaymentDue = this.TotalPaymentAmout = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan;
            }
        });

        this.subscription = this.commService.getClearCashiering().subscribe(res => {
            if (res) {
                this.PaymentForm.reset();
                this.CheckConnection();
                this.submitted = false;
                this.isPaymentSuccess = false;
                this.PaymentDue = 0;
                this.ChangeAmt = 0;
                this.TotalPaymentAmout = 0;
                this.ReceiptNo = '';
                this.totalofCitations = 0;
                this.totalofDMV = 0;
                this.totalofPermits = 0;
                this.totalofTowingFee = 0;
                this.totalofAP = 0;

                this.serviceCitationsData = null;
                this.CIDataList = [];

                this.servicePermitsData = null;

                this.serviceDMVData = null;
                this.DMVDetailsList = [];

                this.serviceFeesTabData = null;
                this.FeesList = [];

                this.CartList = [];
                this.getSum();
                this.sum = 0;
                this.ErrorMsg = this.SuccessMsg = '';
            }
        });
        this.commService.getCreditCardAutoFillData().subscribe(async res => {
            if (res) {
                let ReferenceId = localStorage.getItem('CashierSequenceNo')
                if (!ReferenceId) {
                    ReferenceId = '';
                }
                let fillCreditCardAmount = await this._dataService.get(Global.DLMS_API_URL + `api/Cashiering/AutoFillCreditCardAmount?RecordId=${this.RecordId}&ReferenceId=${ReferenceId}`).toPromise().catch(() => { })
                if (fillCreditCardAmount > 0) {
                    this.f.creditCardFormControl.setValue(fillCreditCardAmount);
                    this.f.creditCardFormControl.disable();
                    this.IsMultiCardPayment = true;
                } else {
                    this.IsMultiCardPayment = false;
                }
                let ev: any = null;
                this.onCheckChange(ev);

            }
        });
        this.commService.getRefreshData().subscribe(async res => {
            if (res) {
                this.SuccessMessage = '';
                this.ErrorMessage = '';
                this.SuccessMessage = `Device is connected`;
                if (this.PaymentProfileList.length > 0) {         
                    console.log('payment profile greater than one');           
                }
                else{
                    this.f.IsCloverPaymentControl.setValue('true');
                    console.log('payment profile not greater than one');
                }                
                //this.LoadPaymentProfile();
            }
        });
    }

    ngOnInit(): void {
        this.initForm();
        this.connectURL = Global.PoliceURL + "officer/Tabs/ReleaseCheckListTab.aspx";
        this.towCompanyURL = Global.PoliceURL + "/officer/WreckerCompanyDetails.aspx?FromPage=Disposition";
        this.f.checkNoFormControl.disable();
        this.f.refNoFormControl.disable();
        this.LoadReleaseTo();
        this.LoadCompany();
        this.LoadState();
        if (this.ParentScreenName == 'Cashiering') {
            this.f.releaseToFormControl.setValue(null);
            this.f.releaseToFormControl.clearValidators();
            this.f.releaseToFormControl.updateValueAndValidity();

            this.f.towCompanyFormControl.setValue(null);
            this.f.towCompanyFormControl.clearValidators();
            this.f.towCompanyFormControl.updateValueAndValidity();

            this.f.releaseToNameFormControl.setValue(null);
            this.f.releaseToNameFormControl.clearValidators();
            this.f.releaseToNameFormControl.updateValueAndValidity();

            this.f.releaseToNameTxtFormControl.setValue(null);
            this.f.releaseToNameTxtFormControl.clearValidators();
            this.f.releaseToNameTxtFormControl.updateValueAndValidity();

            this.f.IsAdminReleaseControl.setValue(null);
            this.f.IsAdminReleaseControl.clearValidators();
            this.f.IsAdminReleaseControl.updateValueAndValidity();
        }
        this.LoadCart('');
        this.LoadCloverKeys();
        const hsn = localStorage.getItem('hsn');
        this.getConnectStatus(hsn);

        window.addEventListener('message', (event) => {
            if (event != null && event.origin.includes('cardconnect')) {
                this.ErrorMsg = '';
                var token = JSON.parse(event.data);
                if (token.message !== undefined) {
                    localStorage.setItem('VirtualToken', token.message);
                }
                if (token.validationError != undefined) {
                    this.ErrorMsg = token.validationError;
                }
                console.log(token);
                this.DisablePayButton();
            }
        }, false);

        this.LoadPaymentProfile();
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    get f() { return this.PaymentForm.controls; }

    initForm() {
        this.PaymentForm = this.formBuilder.group({
            cashFormControl: [''],
            creditCardFormControl: [''],
            debitFormControl: [''],
            refNoFormControl: [''],
            checkFormControl: [''],
            checkNoFormControl: [''],
            PaidByFormControl: [''],// , Validators.compose([Validators.required])
            AddressFormControl: [''],
            phoneFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])],
            emailFormControl: ['', Validators.compose([Validators.pattern(Global.EMAIL_REGEX)])],
            ZipFormControl: [''],
            removePlatesFormControl: [''],
            releaseToFormControl: ['', Validators.compose([Validators.required])],
            towCompanyFormControl: ['', Validators.compose([Validators.required])],
            releaseToNameFormControl: ['', Validators.compose([Validators.required])],
            releaseToNameTxtFormControl: ['', Validators.compose([Validators.required])],
            IsAdminReleaseControl: ['', Validators.compose([Validators.required])],
            removePlatesOptionFormControl: [''],
            removePlatesInstructionFormControl: [''],
            IsCloverPaymentControl: ['', Validators.compose([Validators.required])],
            IsVirtualPaymentControl: [''],
            IsProfilePaymentControl: [''],
            paymentProfileFormControl: [''],
            authNoFormControl: [''],
            eTIMEClearanceFormControl:['', Validators.compose([Validators.requiredTrue])]
        });
    }

    onCheckChange(ev) {
        let totalInputPayment = Number(this.f.cashFormControl.value) + Number(this.f.creditCardFormControl.value) + Number(this.f.debitFormControl.value) + Number(this.f.checkFormControl.value);

        let totalAmount = 0;
        if (this.ParentScreenName == 'Disposition') {
            totalAmount = this.totalofCitations + this.totalofTowingFee + this.totalofDMV + this.totalofAP + this.totalofPaymentPlan;
        } else {
            totalAmount = this.totalofCitations + this.totalofPermits + this.totalofDMV + this.totalofAP + this.totalofPaymentPlan;
        }
        this.TotalPaymentAmout = Number(totalAmount.toFixed(2));
        this.PaymentDue = (this.TotalPaymentAmout - totalInputPayment) > 0 ? this.TotalPaymentAmout - totalInputPayment : 0;
        this.ChangeAmt = (totalInputPayment - this.TotalPaymentAmout) > 0 ? totalInputPayment - this.TotalPaymentAmout : 0;
        let data = {
            'ChangeAmt': this.ChangeAmt,
            'PaymentDue': this.PaymentDue,
            'TotalPaymentAmout': this.TotalPaymentAmout,
            'ReceiptNo': ''
        }
        this.commService.sendPaymentCartData(data);
        if (this.TotalPaymentAmout == 0) {
            this.f.cashFormControl.enable();
            this.f.creditCardFormControl.enable();
            this.f.debitFormControl.enable();
            this.f.checkFormControl.enable();
        }
        else if (totalInputPayment > this.TotalPaymentAmout) {
            if (Number(this.f.cashFormControl.value) > 0) {
                this.f.cashFormControl.enable();
            }
            else {
                this.f.cashFormControl.disable();
            }
            if (Number(this.f.creditCardFormControl.value) > 0) {
                this.f.creditCardFormControl.enable();
            }
            else {
                this.f.creditCardFormControl.disable();
            }
            if (Number(this.f.debitFormControl.value) > 0) {
                this.f.debitFormControl.enable();
            }
            else {
                this.f.debitFormControl.disable();
            }
            if (Number(this.f.checkFormControl.value) > 0) {
                this.f.checkFormControl.enable();
            }
            else {
                this.f.checkFormControl.disable();
            }
        }
        else if (totalInputPayment == this.TotalPaymentAmout) {
            if (Number(this.f.cashFormControl.value) > 0) {
                this.f.cashFormControl.enable();
            }
            else {
                this.f.cashFormControl.disable();
            }
            if (Number(this.f.creditCardFormControl.value) > 0) {
                this.f.creditCardFormControl.enable();
            }
            else {
                this.f.creditCardFormControl.disable();
            }
            if (Number(this.f.debitFormControl.value) > 0) {
                this.f.debitFormControl.enable();
            }
            else {
                this.f.debitFormControl.disable();
            }
            if (Number(this.f.checkFormControl.value) > 0) {
                this.f.checkFormControl.enable();
            }
            else {
                this.f.checkFormControl.disable();
            }
        }
        else {
            this.f.cashFormControl.enable();
            this.f.creditCardFormControl.enable();
            this.f.debitFormControl.enable();
            this.f.checkFormControl.enable();
        }

        let checkValue = this.f.checkFormControl.value;
        if (checkValue) {
            this.f.checkNoFormControl.enable();
            this.txtCheckNo.nativeElement.focus();
        } else {
            this.f.checkNoFormControl.disable();
            this.f.checkNoFormControl.reset();
        }

        let creditCardValue = this.f.creditCardFormControl.value;
        // let debitCardValue = this.f.creditCardFormControl.value;
        this.f.releaseToNameFormControl.clearValidators();
        this.f.releaseToNameFormControl.updateValueAndValidity();
        if (creditCardValue) {
            if (this.CloverKeys[5].Value == false || this.f.IsCloverPaymentControl.value == 'false') {
                if (this.IsVirtualPayment) {
                    this.f.refNoFormControl.disable();
                    this.f.refNoFormControl.clearValidators();
                    this.f.refNoFormControl.updateValueAndValidity();
                    this.f.refNoFormControl.reset();
                }else if (this.IsProfilePayment) {
                    //this.f.creditCardFormControl.disable();
                    //this.f.creditCardFormControl.updateValueAndValidity();
                    this.f.cashFormControl.disable();
                    this.f.debitFormControl.disable();
                    this.f.checkFormControl.disable();
                } else {
                    this.f.refNoFormControl.enable();
                    this.f.refNoFormControl.setValidators([Validators.required]);
                    this.f.refNoFormControl.updateValueAndValidity();
                    this.txtRefNo.nativeElement.focus();
                }
            } else {
                this.f.refNoFormControl.disable();
                this.f.refNoFormControl.clearValidators();
                this.f.refNoFormControl.updateValueAndValidity();
                this.f.refNoFormControl.reset();
            }
        } else {
            this.f.refNoFormControl.disable();
            this.f.refNoFormControl.clearValidators();
            this.f.refNoFormControl.updateValueAndValidity();
            this.f.refNoFormControl.reset();
        }
        if (this.IsMultiCardPayment && Number(this.f.creditCardFormControl.value) > 0) {
            this.f.creditCardFormControl.disable();
        }
        if (this.f.IsCloverPaymentControl.value == 'true') {
            this.IsVirtualPayment = false;
            this.PaymentProfileList=[];
            this.ProfileId =null;
            this.f.IsVirtualPaymentControl.reset();
            if (this.IsProfilePayment) {
                this.f.creditCardFormControl.setValue(null);
                this.f.cashFormControl.enable();
                this.f.creditCardFormControl.enable();
                this.f.debitFormControl.enable();
                this.f.checkFormControl.enable();
            }
            this.IsProfilePayment = false;
            this.f.IsProfilePaymentControl.reset();
        }
        // else{
        //     console.log('inside oncheckchange else');
        //     this.LoadPaymentProfile();
        // }
    }

    async SavePay() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;

        if (this.PaymentForm.invalid) {
            return;
        }
        if (!this.isAdministrativeRelease && this.TotalPaymentAmout == 0) {
            this.ErrorMsg = 'Payment can not process. Total payment due is $0.00 ';
            return;
        }
        const CashieringPaymentList = [];

        if ((this.ParentScreenName == 'Cashiering') || (this.ParentScreenName == 'Disposition' && this.VehicleStatus == 'Received')) {

            // Citation Payment
            if (this.CIDataList.length > 0) {
                this.CIDataList.forEach(x => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    payModel.CitationId = Number(x.CitationId);
                    payModel.DMVID = null;
                    payModel.PaymentPlanId = null;
                    if (this.ParentScreenName == 'Disposition') {
                        payModel.TowId = this.TowId;
                    } else {
                        payModel.TowId = null;
                    }
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(x.AMOUNTDUE);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = x.Description;
                    payModel.PaymentType = 'Citations';
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = x.LICPLATE;
                    payModel.State = x.LICSTATEPROV;
                    payModel.CitationNo = x.ISSUENO;
                    payModel.PaymentAmount = x.AMOUNTDUE;
                    payModel.PaymentMethod = this.getPaymentMethod();
                    payModel.SectionInd = 'Citation';

                    if (this.ParentScreenName == 'Disposition') {
                        payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                        payModel.OwnerId = this.f.releaseToNameFormControl.value;
                        if (this.f.releaseToNameTxtFormControl.value) {
                            payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                        } else {
                            if (this.ReleaseToNameList.length > 0) {
                                const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                                payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                            }
                        }
                        payModel.TowCompanyId = this.SelectedTowCompanyid;
                    }
                    else {
                        payModel.ReleasedTo = null;
                        payModel.OwnerId = null;
                        payModel.OwnerFirstName = null;
                        payModel.TowCompanyId = null;
                    }
                    CashieringPaymentList.push(payModel);
                });
            }

            // DMV Payment
            if (this.serviceDMVData && this.serviceDMVData.dmvModel) {
                this.serviceDMVData.dmvModel.DMVDetailsList.forEach(dm => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    payModel.CitationId = null;
                    payModel.DMVID = null;
                    payModel.PaymentPlanId = null;
                    if (this.ParentScreenName == 'Disposition') {
                        payModel.TowId = this.TowId;
                    } else {
                        payModel.TowId = null;
                    }
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(dm.amount);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = dm.Description;
                    payModel.PaymentType = 'DMV';
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = '';
                    payModel.State = '';
                    payModel.CitationNo = '';
                    payModel.PaymentAmount = '';
                    payModel.PaymentMethod = this.getPaymentMethod();
                    payModel.SectionInd = 'DMV';

                    if (this.ParentScreenName == 'Disposition') {
                        payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                        payModel.OwnerId = this.f.releaseToNameFormControl.value;
                        if (this.f.releaseToNameTxtFormControl.value) {
                            payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                        } else {
                            if (this.ReleaseToNameList.length > 0) {
                                const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                                payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                            }
                        }
                        payModel.TowCompanyId = this.SelectedTowCompanyid;
                    }
                    else {
                        payModel.ReleasedTo = null;
                        payModel.OwnerId = null;
                        payModel.OwnerFirstName = null;
                        payModel.TowCompanyId = null;
                    }
                    CashieringPaymentList.push(payModel);
                });
            }
        }

        // Additional Payment
        if ((this.ParentScreenName == 'Cashiering') || (this.ParentScreenName == 'Disposition' && this.VehicleStatus == 'Released')) {
            if (this.serviceAPData && this.serviceAPData.apModel) {
                this.serviceAPData.apModel.APDetailsList.forEach(ap => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    payModel.CitationId = null;
                    payModel.DMVID = null;
                    payModel.PaymentPlanId = null;
                    if (this.ParentScreenName == 'Disposition') {
                        payModel.TowId = this.TowId;
                    } else {
                        payModel.TowId = null;
                    }
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(ap.amount);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = ap.Description;
                    payModel.PaymentType = 'Other fee';
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = '';
                    payModel.State = '';
                    payModel.CitationNo = '';
                    payModel.PaymentAmount = '';
                    payModel.PaymentMethod = this.getPaymentMethod();
                    payModel.SectionInd = 'AP';

                    if (this.ParentScreenName == 'Disposition') {
                        payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                        payModel.OwnerId = this.f.releaseToNameFormControl.value;
                        if (this.f.releaseToNameTxtFormControl.value) {
                            payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                        } else {
                            if (this.ReleaseToNameList.length > 0) {
                                const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                                payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                            }
                        }
                        payModel.TowCompanyId = this.SelectedTowCompanyid;
                    }
                    else {
                        payModel.ReleasedTo = null;
                        payModel.OwnerId = null;
                        payModel.OwnerFirstName = null;
                        payModel.TowCompanyId = null;
                    }
                    CashieringPaymentList.push(payModel);
                });
            }
        }

        if (this.ParentScreenName == 'Cashiering') {
            // Permit Payment
            if (this.servicePermitsData && this.servicePermitsData.permitModel) {
                this.servicePermitsData.permitModel.PermitDetailsList.forEach(dm => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    payModel.CitationId = null;
                    payModel.DMVID = null;
                    payModel.PaymentPlanId = null;
                    if (this.ParentScreenName == 'Disposition') {
                        payModel.TowId = this.TowId;
                    } else {
                        payModel.TowId = null;
                    }
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(dm.amount);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = dm.Description;
                    payModel.PaymentType = 'Permits';
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = '';
                    payModel.State = '';
                    payModel.CitationNo = '';
                    payModel.PaymentAmount = '';
                    payModel.PaymentMethod = this.getPaymentMethod();
                    payModel.SectionInd = 'Permits';

                    if (this.ParentScreenName == 'Disposition') {
                        payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                        payModel.OwnerId = this.f.releaseToNameFormControl.value;
                        if (this.f.releaseToNameTxtFormControl.value) {
                            payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                        } else {
                            if (this.ReleaseToNameList.length > 0) {
                                const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                                payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                            }
                        }
                        payModel.TowCompanyId = this.SelectedTowCompanyid;
                    }
                    else {
                        payModel.ReleasedTo = null;
                        payModel.OwnerId = null;
                        payModel.OwnerFirstName = null;
                        payModel.TowCompanyId = null;
                    }
                    CashieringPaymentList.push(payModel);
                });
            }

            // Payment Plan Payment
            if (this.servicePaymentPlanData && this.servicePaymentPlanData.paymentPlanModel) {
                this.servicePaymentPlanData.paymentPlanModel.PaymentPlanDetailsList.forEach(dm => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    payModel.CitationId = null;
                    payModel.DMVID = null;
                    payModel.PaymentPlanId = null;
                    if (this.ParentScreenName == 'Disposition') {
                        payModel.TowId = this.TowId;
                    } else {
                        payModel.TowId = null;
                    }
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(dm.amount);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = dm.Description;
                    payModel.PaymentType = 'Fleet Payment';
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = '';
                    payModel.State = '';
                    payModel.CitationNo = '';
                    payModel.PaymentAmount = '';
                    payModel.PaymentMethod = this.getPaymentMethod();
                    payModel.SectionInd = 'PaymentPlan';

                    if (this.ParentScreenName == 'Disposition') {
                        payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                        payModel.OwnerId = this.f.releaseToNameFormControl.value;
                        if (this.f.releaseToNameTxtFormControl.value) {
                            payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                        } else {
                            if (this.ReleaseToNameList.length > 0) {
                                const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                                payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                            }
                        }
                        payModel.TowCompanyId = this.SelectedTowCompanyid;
                    }
                    else {
                        payModel.ReleasedTo = null;
                        payModel.OwnerId = null;
                        payModel.OwnerFirstName = null;
                        payModel.TowCompanyId = null;
                    }
                    CashieringPaymentList.push(payModel);
                });
            }
        }

        // Disposition Payment
        if (this.ParentScreenName == 'Disposition' && (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released')) {
            if (this.serviceFeesTabData && this.serviceFeesTabData.FeesList) {
                this.serviceFeesTabData.FeesList.forEach(x => {
                    let payModel: CashieringPaymentDetailsModel = new CashieringPaymentDetailsModel();
                    payModel.PermitId = null;
                    if (x.CitationId) {
                        payModel.CitationId = Number(x.CitationId);
                    } else {
                        payModel.CitationId = null;
                    }

                    if (x.DMVID) {
                        payModel.DMVID = Number(x.DMVID);
                    } else {
                        payModel.DMVID = null;
                    }

                    payModel.PaymentPlanId = null;
                    payModel.TowId = this.TowId;
                    payModel.AuctionBidderId = null;
                    payModel.AuctionDetailsId = null;
                    payModel.Cash = this.isAdministrativeRelease == true ? 0 : this.f.cashFormControl.value;
                    payModel.CreditCard = this.isAdministrativeRelease == true ? 0 : this.f.creditCardFormControl.value;
                    payModel.DebitCard = this.isAdministrativeRelease == true ? 0 : this.f.debitFormControl.value;
                    payModel.RefNo = this.isAdministrativeRelease == true ? '' : this.f.refNoFormControl.value;
                    payModel.Check = this.isAdministrativeRelease == true ? 0 : this.f.checkFormControl.value;
                    payModel.ChequeNo = this.isAdministrativeRelease == true ? '' : this.f.checkNoFormControl.value;
                    payModel.TotalPaymentAmout = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
                    payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
                    payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
                    payModel.PaymentDueAmout = this.isAdministrativeRelease == true ? 0 : Number(x.Total);
                    payModel.Address = this.f.AddressFormControl.value;
                    if (this.f.phoneFormControl.value) {
                        payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }
                    payModel.Email = this.f.emailFormControl.value;
                    payModel.PaidBy = this.f.PaidByFormControl.value;
                    payModel.FeeDescription = x.Description;
                    if (Number(x.FeeXREFId) > 0) {
                        if (String(x.Description).includes('Tow Fee-Heavy Duty')) {
                            payModel.PaymentType = 'Tow Fee - Heavy Duty';
                        }
                        else if (String(x.Description).includes('Storage Fee-Heavy Duty')) {
                            payModel.PaymentType = 'Storage Fee - Heavy Duty';
                        }
                        else {
                            payModel.PaymentType = String(x.Description).split('-')[0].trim();
                        }
                    } else {
                        if (String(x.Description) == "TOW FEE") {
                            payModel.PaymentType = String(x.Description).split('-')[0].trim();
                        }
                        else {
                            payModel.PaymentType = 'Other fee';
                        }
                    }
                    payModel.UserId = this.UserId;
                    payModel.LicPlate = '';
                    payModel.State = '';
                    payModel.CitationNo = '';
                    payModel.PaymentAmount = '';
                    payModel.PaymentMethod = this.isAdministrativeRelease == true ? '' : this.getPaymentMethod();

                    payModel.SectionInd = x.SectionId;

                    payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
                    payModel.OwnerId = this.f.releaseToNameFormControl.value;
                    if (this.f.releaseToNameTxtFormControl.value) {
                        payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
                    } else {
                        if (this.ReleaseToNameList.length > 0) {
                            const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(payModel.OwnerId));
                            payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                        }
                    }
                    payModel.TowCompanyId = this.SelectedTowCompanyid;
                    CashieringPaymentList.push(payModel);
                });
            }
        }

        if (this.ParentScreenName == 'Disposition' && this.VehicleStatus == 'Released'
            && this.serviceAPData && this.serviceAPData.apModel.APDetailsList.length == 0
            && this.serviceFeesTabData && this.serviceFeesTabData.FeesList.length == 0) {
            this.ErrorMsg = 'No items available for payment';
        }

        const cModel: CashieringModel = new CashieringModel();

        // Permit Save
        if (this.servicePermitsData && this.servicePermitsData.permitModel) {
            cModel.cashieringPermitModel = this.servicePermitsData.permitModel;
        }

        // DMV Save
        if (this.serviceDMVData && this.serviceDMVData.dmvModel) {
            cModel.cashieringDMVModel = this.serviceDMVData.dmvModel;
        }

        // Payment Plan Save
        if (this.servicePaymentPlanData && this.servicePaymentPlanData.paymentPlanModel) {
            cModel.cashieringPaymentPlanModel = this.servicePaymentPlanData.paymentPlanModel;
        }

        let cashieringPaymentModel: CashieringPaymentModel = new CashieringPaymentModel();
        cashieringPaymentModel.CashieringPaymentList = CashieringPaymentList;

        cModel.cashieringPaymentModel = cashieringPaymentModel;
        cModel.IsAdminRelease = this.f.IsAdminReleaseControl.value;
        cModel.RemovePlates = this.f.removePlatesFormControl.value;
        cModel.RemovePlatesOption = this.f.removePlatesOptionFormControl.value;
        cModel.RemovePlatesInstruction = this.f.removePlatesInstructionFormControl.value;
        cModel.IsMultiCardPayment = this.IsMultiCardPayment;
        cModel.IsCloverPayment = this.f.IsCloverPaymentControl.value;
        cModel.Zip = this.f.ZipFormControl.value;
        cModel.ProfileId = this.ProfileId;
        cModel.PaymentSource = this.PaymentSource;
        cModel.RecordId = this.RecordId;
        if (this.CloverKeys[5].Value == true) {
            const hsn = localStorage.getItem('hsn');
            if (hsn) {
                cModel.HSN = hsn;
            }

            if (!hsn && this.f.creditCardFormControl.value && this.f.IsCloverPaymentControl.value == 'true') {
                this._dataService.modalPromptDetailsRef = this.modalService.show(this.templateDevicePrompt, Object.assign({}, this.config, { class: 'gray modal-xl modal-dialog-center' }));
                return;
            }
        }

        let VirtualToken: any = localStorage.getItem('VirtualToken');;
        cModel.IsVirtualPayment = this.IsVirtualPayment;
        if (VirtualToken !== undefined && VirtualToken != '') {
            cModel.Account = VirtualToken;
        }



        if (this.ParentScreenName == 'Cashiering') {
            const cno = localStorage.getItem('CashierSequenceNo')
            if (cno) {
                cModel.ReferenceId = cno;
            }
        }
        const ele = document.getElementById("sigImageData") as HTMLTextAreaElement;
        if (ele) {
            cModel.base64Image = ele.value;
        } else {
            cModel.base64Image = '';
        }

        cModel.eTIMEClearance = this.f.eTIMEClearanceFormControl.value;


        if (cModel.cashieringPaymentModel.CashieringPaymentList.length > 0 && !this.isPaymentSuccess) {
            let cashAmt = this.f.cashFormControl.value;
            let creditCardAmt = this.f.creditCardFormControl.value;
            let debitCardAmt = this.f.debitFormControl.value;
            let checkAmt = this.f.checkFormControl.value;

            if (!this.isAdministrativeRelease) {
                if (!cashAmt && !creditCardAmt && !debitCardAmt && !checkAmt) {
                    this.ErrorMsg = "Please enter amount in order to proceed";
                    return;
                }

                if (Number(cashAmt) == 0 && Number(creditCardAmt) == 0 && Number(checkAmt) == 0) {
                    this.ErrorMsg = "Please enter amount in order to proceed";
                    return;
                }

                if (this.PaymentDue > 0) {
                    this.ErrorMsg = 'Please make full payment in order to proceed';
                    return;
                }

                if (Number(creditCardAmt) > this.TotalPaymentAmout) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    return;
                }
                else if (Number(debitCardAmt) > this.TotalPaymentAmout) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    return;
                }
                if (Number(checkAmt) > this.TotalPaymentAmout) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    return;
                }
                if (checkAmt && Number(checkAmt) > 0 && !this.f.checkNoFormControl.value) {
                    this.ErrorMsg = "Please enter check #";
                    return;
                }
                if (this.IsVirtualPayment == true && VirtualToken == '') {
                    this.ErrorMsg = "Please enter valid creditcard details.";
                    return;
                }
                if (this.IsVirtualPayment == true && VirtualToken == "undefined") {
                    this.ErrorMsg = "Please enter valid creditcard details.";
                    return;
                }
            }

            this.loading = true;
            this.ReceiptNo = '';
            this.isPaymentSuccess = false;
            this.startloader();
            this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SaveCashiering', cModel).subscribe(result => {
                if (result.PaymentId > 0) {
                    this.SuccessMsg = result.Message;
                    this.ReceiptNo = result.ReceiptNo;
                    this.PaymentId = result.PaymentId;
                    this.isPaymentSuccess = true;
                    this.IsVirtualPayment = false;
                    this.closeloader();
                    this.printReceipt();
                    let data = {
                        'ChangeAmt': this.isAdministrativeRelease == true ? 0 : this.ChangeAmt,
                        'PaymentDue': this.isAdministrativeRelease == true ? 0 : this.PaymentDue,
                        'TotalPaymentAmout': this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout,
                        'ReceiptNo': result.ReceiptNo,
                        'PermitId': result.PermitId,
                        'ApplicationNo': result.ApplicationNo,
                        'PaymentId': result.PaymentId
                    }
                    this.commService.sendPaymentCartData(data);
                    this.commService.sendPaymentPermitData(data);
                    this.PaymentForm.reset();
                    this.submitted = false;
                    this.loading = false;
                    localStorage.removeItem('VirtualToken');
                    localStorage.removeItem('CashierSequenceNo');
                    if (this.ParentScreenName == 'Disposition' && this.VehicleStatus == 'Received') {
                        window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Release";
                    }
                    // window.top.postMessage("UpdateVehicleStatus", Global.PoliceURL);
                } else {
                    this.ErrorMsg = result.Message;
                    this.ReceiptNo = '';
                    this.isPaymentSuccess = false;
                    this.loading = false;
                    this.closeloader();
                    if (this.IsVirtualPayment) {
                        let url = this.CloverKeys[1].Value
                        let splitedUrl = url.split('/')[2];
                        this.IframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://${splitedUrl}/itoke/ajax-tokenizer.html?formatinput=true&invalidinputevent=true&cardnumbernumericonly=true&cardinputmaxlength=25&usecvv=true&useexpiry=true&cardlabel=Credit Card Number
            &expirylabel=Expiration Date&
            cvvlabel=CVV&css=%2Eerror%7Bcolor%3A%20red%3B%7D%23ccnumfield%7Bmargin-bottom%3A%205px%3Bwidth%3A95%25%20%3Bpadding%3A6px%208px!important%3Bfont-size%3A12px%20!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpirymonth%7Bwidth%3A45%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpiryyear%7Bwidth%3A46%25%20!important%3Bmargin-bottom%3A%205px%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23cccvvfield%7Bwidth%3A41%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7Dform%23tokenform%7Bmargin%3A+6px%3B%7D%23cccardlabel%7Bfont%3A%20menu%3B%7D%23ccexpirylabel%7Bfont%3A%20menu%3B%7D%23cccvvlabel%7Bfont%3A%20menu%3B%7D`);
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error;
                    this.ReceiptNo = '';
                    this.isPaymentSuccess = false;
                    this.loading = false;
                    this.closeloader();
                    if (this.IsVirtualPayment) {
                        let url = this.CloverKeys[1].Value
                        let splitedUrl = url.split('/')[2];
                        this.IframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://${splitedUrl}/itoke/ajax-tokenizer.html?formatinput=true&invalidinputevent=true&cardnumbernumericonly=true&cardinputmaxlength=25&usecvv=true&useexpiry=true&cardlabel=Credit Card Number
                        &expirylabel=Expiration Date&
                        cvvlabel=CVV&css=%2Eerror%7Bcolor%3A%20red%3B%7D%23ccnumfield%7Bmargin-bottom%3A%205px%3Bwidth%3A95%25%20%3Bpadding%3A6px%208px!important%3Bfont-size%3A12px%20!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpirymonth%7Bwidth%3A45%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpiryyear%7Bwidth%3A46%25%20!important%3Bmargin-bottom%3A%205px%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23cccvvfield%7Bwidth%3A41%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7Dform%23tokenform%7Bmargin%3A+6px%3B%7D%23cccardlabel%7Bfont%3A%20menu%3B%7D%23ccexpirylabel%7Bfont%3A%20menu%3B%7D%23cccvvlabel%7Bfont%3A%20menu%3B%7D`);
                    }
                });
        }

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

    printReceipt() {
        if (this.ParentScreenName == 'Disposition') {
            let releasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
            if (releasedTo == 'A') { // || item.ReleasedTo == 'M'
                window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + this.PaymentId, '_blank');
            } else {
                window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + this.PaymentId, '_blank');
            }
        }
        else {
            window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + this.PaymentId, '_blank');
        }
    }

    // changeRadio(e) {
    //     this.radioSelected = e.target.value;
    //     this.f.debitFormControl.reset();
    //     this.f.creditCardFormControl.reset();
    //     this.f.refNoFormControl.reset();
    //     this.onCheckChange('');
    // }

    checkedRemovePlates(ev) {
        if (ev.target.checked) {
            this.IsCheckedRemovePlates = true;
            this.f.removePlatesOptionFormControl.setValidators([Validators.required]);
            this.f.removePlatesOptionFormControl.updateValueAndValidity();
        } else {
            this.IsCheckedRemovePlates = false;
            this.f.removePlatesOptionFormControl.clearValidators();
            this.f.removePlatesOptionFormControl.updateValueAndValidity();
        }
    }
    
    changeAdminReleaseRadio(e) {
        if (e.target.value == 'Yes') {
            this.isAdministrativeRelease = true;
            this.f.cashFormControl.reset();
            this.f.creditCardFormControl.reset();
            this.f.debitFormControl.reset();
            this.f.refNoFormControl.reset();
            this.f.checkFormControl.reset();
            this.f.checkNoFormControl.reset();
            this.f.IsCloverPaymentControl.reset();

            this.f.cashFormControl.setValue(null);
            this.f.creditCardFormControl.setValue(null);
            this.f.debitFormControl.setValue(null);
            this.f.refNoFormControl.setValue(null);
            this.f.checkFormControl.setValue(null);
            this.f.checkNoFormControl.setValue(null);


            this.f.cashFormControl.disable();
            this.f.creditCardFormControl.disable();
            this.f.debitFormControl.disable();
            this.f.checkFormControl.disable();
            this.f.refNoFormControl.disable();
            this.f.checkNoFormControl.disable();
            this.f.IsCloverPaymentControl.disable();

            this.CIDataList = [];
            this.serviceDMVData = null;
            this.serviceAPData = null;
            this.servicePermitsData = null;
            this.servicePaymentPlanData = null;
        } else {
            this.f.IsCloverPaymentControl.enable();
            if (!this.IsCloverRadioButtonEnable) {
                this.f.IsCloverPaymentControl.setValue('true');
            }
            let totalInputPayment = Number(this.f.cashFormControl.value) + Number(this.f.creditCardFormControl.value) + Number(this.f.debitFormControl.value) + Number(this.f.checkFormControl.value);

            let totalAmount = 0;
            if (this.ParentScreenName == 'Disposition') {
                totalAmount = this.totalofCitations + this.totalofTowingFee + this.totalofDMV + this.totalofAP + this.totalofPaymentPlan;
            } else {
                totalAmount = this.totalofCitations + this.totalofPermits + this.totalofDMV + this.totalofAP + this.totalofPaymentPlan;
            }
            this.TotalPaymentAmout = Number(totalAmount.toFixed(2));
            this.PaymentDue = (this.TotalPaymentAmout - totalInputPayment) > 0 ? this.TotalPaymentAmout - totalInputPayment : 0;
            this.ChangeAmt = (totalInputPayment - this.TotalPaymentAmout) > 0 ? totalInputPayment - this.TotalPaymentAmout : 0;
            if (this.TotalPaymentAmout == 0) {
                this.f.cashFormControl.enable();
                this.f.creditCardFormControl.enable();
                this.f.debitFormControl.enable();
                this.f.checkFormControl.enable();
            }
            else if (totalInputPayment > this.TotalPaymentAmout) {
                if (Number(this.f.cashFormControl.value) > 0) {
                    this.f.cashFormControl.enable();
                }
                else {
                    this.f.cashFormControl.disable();
                }
                if (Number(this.f.creditCardFormControl.value) > 0) {
                    this.f.creditCardFormControl.enable();
                }
                else {
                    this.f.creditCardFormControl.disable();
                }
                if (Number(this.f.debitFormControl.value) > 0) {
                    this.f.debitFormControl.enable();
                }
                else {
                    this.f.debitFormControl.disable();
                }
                if (Number(this.f.checkFormControl.value) > 0) {
                    this.f.checkFormControl.enable();
                }
                else {
                    this.f.checkFormControl.disable();
                }
            }
            else if (totalInputPayment == this.TotalPaymentAmout) {
                if (Number(this.f.cashFormControl.value) > 0) {
                    this.f.cashFormControl.enable();
                }
                else {
                    this.f.cashFormControl.disable();
                }
                if (Number(this.f.creditCardFormControl.value) > 0) {
                    this.f.creditCardFormControl.enable();
                }
                else {
                    this.f.creditCardFormControl.disable();
                }
                if (Number(this.f.debitFormControl.value) > 0) {
                    this.f.debitFormControl.enable();
                }
                else {
                    this.f.debitFormControl.disable();
                }
                if (Number(this.f.checkFormControl.value) > 0) {
                    this.f.checkFormControl.enable();
                }
                else {
                    this.f.checkFormControl.disable();
                }
            }
            else {
                if (this.IsOnlinePayment != 1) {
                    this.f.cashFormControl.enable();
                    this.f.creditCardFormControl.enable();
                    this.f.debitFormControl.enable();
                    this.f.checkFormControl.enable();
                }
            }

            let checkValue = this.f.checkFormControl.value;
            if (checkValue) {
                this.f.checkNoFormControl.enable();
                this.txtCheckNo.nativeElement.focus();
            } else {
                this.f.checkNoFormControl.disable();
                this.f.checkNoFormControl.reset();
            }

            let creditCardValue = this.f.creditCardFormControl.value;
            // let debitCardValue = this.f.creditCardFormControl.value;
            this.f.releaseToNameFormControl.clearValidators();
            this.f.releaseToNameFormControl.updateValueAndValidity();
            if (creditCardValue) {
                if (this.CloverKeys[5].Value == false) {
                    this.f.refNoFormControl.enable();
                    this.f.refNoFormControl.setValidators([Validators.required]);
                    this.f.refNoFormControl.updateValueAndValidity();
                    this.txtRefNo.nativeElement.focus();
                }
            } else {
                this.f.refNoFormControl.disable();
                this.f.refNoFormControl.clearValidators();
                this.f.refNoFormControl.updateValueAndValidity();
                this.f.refNoFormControl.reset();
            }
            this.isAdministrativeRelease = false;
            if (this.IsMultiCardPayment && Number(this.f.creditCardFormControl.value) > 0) {
                this.f.creditCardFormControl.disable();
            }
        }
    }

    changeCloverPaymentRadio(e, template: TemplateRef<any>) {
        let ev: any = null;
        this.onCheckChange(ev);
        if (this.f.IsCloverPaymentControl.value == 'true') {
            this.modaltemplateConfirmClover = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
            //this._dataService.modalPromptDetailsRef = this.modalService.show(this.templateConfirmClover, Object.assign({}, this.config, { class: 'gray modal-xl modal-dialog-center' }));
        }
        else{
            this.LoadPaymentProfile();
        }
    }

    getPaymentMethod() {
        var array = [Number(this.f.cashFormControl.value), Number(this.f.creditCardFormControl.value), Number(this.f.checkFormControl.value)];

        // let cashAmt = Number(this.f.cashFormControl.value) > 0 ? 'CASH' : '';
        // let creditCardAmt = Number(this.f.creditCardFormControl.value) > 0 ? 'CREDIT' : '';
        // let checkAmt = Number(this.f.checkFormControl.value) > 0 ? 'CHECK' : '';

        var largest = Math.max.apply(0, array);
        if (Number(largest) == Number(this.f.cashFormControl.value)) {
            return 'CASH';
        }
        else if (Number(largest) == Number(this.f.creditCardFormControl.value)) {
            return 'CREDIT_CARD';
        }
        else if (Number(largest) == Number(this.f.checkFormControl.value)) {
            return 'CHECK';
        }
    }

    ReleaseToName(towId, type) {
        this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToName?TowId=' + towId + '&Type=' + type)
            .subscribe(res => {
                if (res && res.length > 0) {
                    this.ReleaseToNameList = res;
                    this.f.releaseToNameFormControl.setValue(this.ReleaseToNameList[0].Id);
                    this.f.AddressFormControl.setValue(this.ReleaseToNameList[0].Address);
                } else {
                    this.ReleaseToNameList = [];
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    onNameChange(ev) {
        const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(ev.target.value));
        this.f.AddressFormControl.setValue(this.ReleaseToNameList[i].Address);
    }

    private ReleaseType(Id) {
        if (Id === 1) {
            return 'O';
        } else if (Id === 2) {
            return 'L';
        } else if (Id === 3) {
            return 'I';
        } else if (Id === 4) {
            return 'R';
        } else if (Id === 5) {
            return 'A';
        } else if (Id === 7) {
            return 'T';
        }
    }

    onTowCompanyChange(ev) {
        var towCompanyId: any = ev.target.value;
        let val = this.CompanyList.filter(x => Number(x.TowCompanyId) == Number(towCompanyId));
        this.f.AddressFormControl.setValue(val[0].CompleteAddress);
        this.SelectedTowCompanyid = val[0].TowCompanyId;
        this.SelectedTowCompany = val[0].TowCompanyName;
    }

    refusedChange(ev) {
        let isChecked = ev.target.checked;
        this.IsCheckedRefused = ev.target.checked;
        if (isChecked) {
            this.f.phoneFormControl.clearValidators();
            this.f.phoneFormControl.updateValueAndValidity();
        } else {
            this.f.phoneFormControl.setValidators([Validators.required]);
            this.f.phoneFormControl.updateValueAndValidity();
        }
    }

    onTxtChange(ev) {
        //console.log(ev.target.value);
        this.f.releaseToNameTxtFormControl.setValue(String(ev.target.value).trim());
    }

    enableDisableControles(status: boolean) {
        if (status) {
            this.f.releaseToNameFormControl.enable();
            this.f.releaseToNameFormControl.setValue('');
            this.f.releaseToNameTxtFormControl.enable();
            this.f.phoneFormControl.enable();
            this.f.AddressFormControl.enable();
        } else {
            this.f.releaseToNameFormControl.disable();
            this.f.releaseToNameTxtFormControl.disable();
            this.f.phoneFormControl.disable();
            this.f.AddressFormControl.disable();

            this.f.releaseToNameFormControl.reset();
            this.f.releaseToNameTxtFormControl.reset();
            this.f.AddressFormControl.reset();
            this.f.phoneFormControl.reset();
        }
    }

    LoadCloverKeys() {
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectCloverKeys')
            .subscribe(res => {
                if (res) {
                    this.CloverKeys = res;
                } else {
                    this.CloverKeys = [];
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    LoadCompany() {
        this._dataService.get(Global.DLMS_API_URL + 'api/TowCompany')
            .subscribe(res => {
                if (res) {
                    this.CompanyList = res;
                } else {
                    this.CompanyList = [];
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    LoadReleaseTo() {
        this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseTo')
            .subscribe(res => {
                if (res) {
                    this.MainReleaseToList = res;
                    this.ReleaseToList = this.MainReleaseToList;
                } else {
                    this.ReleaseToList = [];
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    onReleaseToChange(ev) {
        this.showNameText = false;
        this.isTowCompanyRelease = false;
        // this.isAdministrativeRelease = false;
        this.f.AddressFormControl.setValue('', { onlySelf: true });
        const option = ev.target.selectedOptions[0].label;

        this.f.releaseToNameTxtFormControl.setValue(null);
        this.f.releaseToNameTxtFormControl.clearValidators();
        this.f.releaseToNameTxtFormControl.updateValueAndValidity();

        this.f.AddressFormControl.setValue(null);

        this.f.releaseToNameFormControl.setValue(null);
        this.f.releaseToNameFormControl.clearValidators();
        this.f.releaseToNameFormControl.updateValueAndValidity();

        this.f.towCompanyFormControl.setValue(null, { onlySelf: true });
        this.f.towCompanyFormControl.clearValidators();
        this.f.towCompanyFormControl.updateValueAndValidity();

        switch (option) {
            case 'Tow Company':
            case 'Insurance':
                this.showNameText = true;
                // this.isAdministrativeRelease = false;
                this.isTowCompanyRelease = false;
                this.enableDisableControles(true);

                this.f.releaseToNameTxtFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                this.f.releaseToNameFormControl.clearValidators();
                this.f.releaseToNameFormControl.updateValueAndValidity();
                break;
            case 'Administrative Release':
            case 'Release to MPD':
                this.showNameText = true;
                this.isAdministrativeRelease = true;
                this.f.releaseToNameTxtFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                this.enableDisableControles(false);
                this.f.releaseToNameTxtFormControl.enable();
                // this.f.PaidByFormControl.clearValidators();
                // this.f.PaidByFormControl.updateValueAndValidity();
                this.f.cashFormControl.reset();
                this.f.creditCardFormControl.reset();
                this.f.debitFormControl.reset();
                this.f.refNoFormControl.reset();
                this.f.checkFormControl.reset();
                this.f.checkNoFormControl.reset();

                this.f.cashFormControl.setValue(null);
                this.f.creditCardFormControl.setValue(null);
                this.f.debitFormControl.setValue(null);
                this.f.refNoFormControl.setValue(null);
                this.f.checkFormControl.setValue(null);
                this.f.checkNoFormControl.setValue(null);

                this.f.cashFormControl.disable();
                this.f.creditCardFormControl.disable();
                this.f.debitFormControl.disable();
                this.f.checkFormControl.disable();
                // creditCard.disabled = true;
                // debitCard.disabled = true;
                break;
            /* case 'Tow Company':
                this.isTowCompanyRelease = true;
                this.f.towCompanyFormControl.setValidators([Validators.required]);
                this.f.towCompanyFormControl.updateValueAndValidity();
                this.f.AddressFormControl.disable();
                this.f.phoneFormControl.disable();
                break; */
            case 'Lien':
            case 'Owner':
                this.showNameText = false;
                // this.isAdministrativeRelease = false;
                this.isTowCompanyRelease = false;
                this.enableDisableControles(true);
                this.f.towCompanyFormControl.setValue(0, { onlySelf: true });
                this.f.releaseToNameFormControl.setValidators([Validators.required]);
                this.f.releaseToNameFormControl.updateValueAndValidity();
                this.f.releaseToNameTxtFormControl.clearValidators();
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                this.f.AddressFormControl.disable();
                // this.f.phoneFormControl.disable();
                break;
            case 'Other':
                this.showNameText = true;
                this.f.releaseToNameTxtFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                // this.f.AddressFormControl.setValidators([Validators.required]);
                // this.f.AddressFormControl.updateValueAndValidity();
                this.enableDisableControles(true);
                break;
            default:
                // this.isAdministrativeRelease = false;
                this.isTowCompanyRelease = false;
                this.enableDisableControles(true);
                this.f.towCompanyFormControl.setValue(0, { onlySelf: true });
                this.f.releaseToNameFormControl.setValidators([Validators.required]);
                this.f.releaseToNameFormControl.updateValueAndValidity();
                this.f.releaseToNameTxtFormControl.clearValidators();
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                break;
        }
        this.ReleaseToName(this.TowId, this.ReleaseType(Number(ev.target.value)));
    }

    LoadState() {
        this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
            .subscribe(states => {
                this.StateList = states;
            }, error => this.ErrorMsg = <any>error);
    }

    LoadCart(type: string) {
        this.CartList = [];
        let CTList = this.CIDataList;
        let DMVList = this.DMVDetailsList;
        let PermitList = this.PermitDetailsList;
        let PaymentPlanList = this.PaymentPlanDetailsList;
        let OtherFeeList = this.APDetailsList;
        this.sum = 0;

        CTList.forEach((item, index) => {
            this.CartList.push({ Description: item.ISSUENO + ' ' + item.LICPLATE + ' ' + item.LICSTATEPROV, Amount: item.AMOUNTDUE, CitationNo: item.ISSUENO, Type: 'Citation' });
        })
        DMVList.forEach((item, index) => {
            let state = this.StateList.filter(x => x.StateId === item.stateId)[0].State_Code;
            this.CartList.push({ Description: item.licensePlate, CartDesc: item.Description + ' ' + state, Amount: item.amount, CitationNo: '', Type: 'DMV' });
        })
        PermitList.forEach((item, index) => {
            this.CartList.push({ Description: item.permitNo, CartDesc: item.Description, Amount: item.amount, CitationNo: '', Type: 'Permit' });
        })
        PaymentPlanList.forEach((item, index) => {
            this.CartList.push({ Description: item.paymentPlanNo, CartDesc: item.Description, Amount: item.amount, CitationNo: '', Type: 'PaymentPlan' });
        })
        OtherFeeList.forEach((item, index) => {
            this.CartList.push({ Description: item.Description, CartDesc: item.Description, Amount: item.amount, CitationNo: '', Type: 'OtherFees' });
        })
        this.sum = this.getSum();
    }

    DeleteCart(index: number) {
        this.commService.sendCartData(this.CartList[index]);
        this.CartList.splice(index, 1);
        this.sum = this.getSum();
    }

    getSum() {
        let sum = 0;
        for (let index = 0; index < this.CartList.length; index++) {
            const element = this.CartList[index];
            if (element.Amount) {
                sum += Number(element.Amount);
            } else {
                sum += Number(0);
            }
        }
        return sum;
    }

    OpenSignature(template: TemplateRef<any>) {
        this.modalSignatureRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    }

    closeSignatureModal() {
        this.modalSignatureRef.hide();
    }

    onSignature() {
        signature.onSign();
    }

    onSignatureDone(ind) {
        signature.onDone(ind);
        if (ind == "Yes") {
            const ele = document.getElementById("hfCloseInd") as HTMLInputElement;
            if (ele.innerText != "Failure") {
                this.closeSignatureModal();
            }
        }
    }
    closeConfirmCloverModal() {
        this.modaltemplateConfirmClover.hide();  

    }
    onCloverDone(ind) {       
        if (ind == "Yes") {
            //console.log('yes')
            let model = {
                RecordId: this.RecordId,
                CustomerPaymentProfileId: this.ProfileId                
            }    
            this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/DeleteAppPayment', model).toPromise().catch(() => { this.loading = false; });            
            this.modaltemplateConfirmClover.hide();        
       
    }
    else{
        this.f.IsCloverPaymentControl.setValue('false');
        this.LoadPaymentProfile();
        this.modaltemplateConfirmClover.hide();        
    }
    }
    openCompany(template: TemplateRef<any>, Company: any) {
        this.modaltemplateCompanyRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
    }

    closeCompanyRef() {
        this.modaltemplateCompanyRef.hide();
        this.LoadCompany();
    }

    getIframeTowCompanyURL(): SafeResourceUrl {
        let conurl = this.urlCache.get(this.towCompanyURL);
        if (!conurl) {
            conurl = this.sanitizer.bypassSecurityTrustResourceUrl(this.towCompanyURL);
            this.urlCache.set(this.towCompanyURL, conurl);
        }
        return conurl;
    }

    isPaymentVisible() {
        if (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released') {
            return true;
        }
        else {
            return false;
        }
    }

    startloader() {
        window.top.postMessage("startloader", Global.PoliceURL);
    }
    closeloader() {
        window.top.postMessage("closeloader", Global.PoliceURL);
    }

    async connect() {
        this.connecting = true;

        const hsn = localStorage.getItem('hsn');

        if (!hsn && this.CloverKeys[5].Value == true) {
            this._dataService.modalPromptDetailsRef = this.modalService.show(this.templateDevicePrompt, Object.assign({}, this.config, { class: 'gray modal-xl modal-dialog-center' }));
            this.connecting = false;
            return;
        }
        //this.getConnectStatus(hsn);
    }

    async getConnectStatus(hsn) {
        const SessionId = localStorage.getItem('SessionId');
        let model = {
            HSN: hsn,
            RequestOrigin: 'Disposition',
            SessionId: SessionId
        }

        let resp = await this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/ConnectTerminal', model).toPromise().catch(() => { this.loading = false; });
        if (resp.Id > 0) {
            this.SuccessMessage = '';
            this.ErrorMessage = '';
            this.SuccessMessage = `Device is connected`;
            this.connecting = false;
            this.f.IsCloverPaymentControl.setValue('true');
            console.log('inside connect terminal');
            this.LoadPaymentProfile();
        } else {
            this.SuccessMessage = '';
            this.ErrorMessage = '';
            this.connecting = false;
            localStorage.removeItem('hsn')
            this.ErrorMessage = 'Device is not connected';
            this.f.IsCloverPaymentControl.setValue('false');
        }
    }

    async CheckConnection() {
        const hsn = localStorage.getItem('hsn');
        if (hsn) {
            this.SuccessMessage = '';
            this.ErrorMessage = '';
            this.SuccessMessage = `Device is connected`;
            this.connecting = false;
            this.f.IsCloverPaymentControl.setValue('true');
            console.log('inside check connection');
            this.LoadPaymentProfile();
        } else {
            this.SuccessMessage = '';
            this.ErrorMessage = '';
            this.connecting = false;
            this.ErrorMessage = 'Device is not connected';
            this.f.IsCloverPaymentControl.setValue('false');
        }
    }

    async MultiplCard(template: TemplateRef<any>) {
        this.CalculateSplitPaymentDue();
        const hsn = localStorage.getItem('hsn');
        const initialState = {
            title: `Confirmation`,
            message: `Please connect the device before payment.`,
            btnCancelText: `Close`,
            btnOkText: `OK`,
            class: 'gray modal-sm modal.in .modal-dialog',
            callback: (result) => {
                if (result == 'yes') {

                }
            }
        };

        if (hsn && this.CloverKeys[5].Value == true) {
            this._dataService.modalPromptDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-sm modal-dialog-center' }));
            return;
        } else {
            this.modalService.show(ConfirmModalComponent, Object.assign({}, this.config, { initialState, class: 'gray modal-sm modal-dialog-center padding-15' }));
        }

    }

    CalculateSplitPaymentDue() {
        if (this.ParentScreenName == 'Cashiering') {
            let totalInputPayment = Number(this.f.cashFormControl.value) + Number(this.f.debitFormControl.value) + Number(this.f.checkFormControl.value);
            let totalamount = this.totalofCitations + this.totalofDMV + this.totalofPermits + this.totalofAP + this.totalofPaymentPlan
            this.SplitCardDueAmount = (totalamount - totalInputPayment) > 0 ? totalamount - totalInputPayment : 0;
        } else {
            let totalInputPayment = Number(this.f.cashFormControl.value) + Number(this.f.debitFormControl.value) + Number(this.f.checkFormControl.value);
            this.SplitCardDueAmount = (this.TotalPaymentAmout - totalInputPayment) > 0 ? this.TotalPaymentAmout - totalInputPayment : 0;
        }

    }

    LoadCasheirSequence() {
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectCashierSequence')
            .subscribe(res => {
                if (res) {
                    this.CashierSequenceNo = res.SerialNo;
                    localStorage.setItem('CashierSequenceNo', this.CashierSequenceNo);
                } else {
                    this.CashierSequenceNo = 0;
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    CheckedVirtualPayment(ev) {
        if (ev.target.checked) {
            this.IsVirtualPayment = true;
            this.f.IsProfilePaymentControl.setValue(false);
            this.f.creditCardFormControl.reset();
            let url = this.CloverKeys[1].Value
            let splitedUrl = url.split('/')[2];
            this.IframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(`https://${splitedUrl}/itoke/ajax-tokenizer.html?formatinput=true&invalidinputevent=true&cardnumbernumericonly=true&cardinputmaxlength=25&usecvv=true&useexpiry=true&cardlabel=Credit Card Number
            &expirylabel=Expiration Date&
            cvvlabel=CVV&css=%2Eerror%7Bcolor%3A%20red%3B%7D%23ccnumfield%7Bmargin-bottom%3A%205px%3Bwidth%3A95%25%20%3Bpadding%3A6px%208px!important%3Bfont-size%3A12px%20!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpirymonth%7Bwidth%3A45%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23ccexpiryyear%7Bwidth%3A46%25%20!important%3Bmargin-bottom%3A%205px%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7D%23cccvvfield%7Bwidth%3A41%25%20!important%3Bpadding%3A6px%208px!important%3Bline-height%3A1.42857143%20!important%3B%20%20%20%20%20color%3A%23555%20!important%3Bbackground-color%3A%23fff%20!important%3Bbackground-image%3Anone%20!important%3Bborder%3A1px%20solid%20%23ccc%20!important%3Bborder-radius%3A0px%20!important%3Bbox-shadow%3Ainset%200%201px%201px%20rgb(0%200%200%20%2F%208%25)%20!important%3Btransition%3Aborder-color%20ease-in-out%20.15s%2Cbox-shadow%20ease-in-out%20.15s%20!important%3Bfont-weight%3A500%20!important%3B%7Dform%23tokenform%7Bmargin%3A+6px%3B%7D%23cccardlabel%7Bfont%3A%20menu%3B%7D%23ccexpirylabel%7Bfont%3A%20menu%3B%7D%23cccvvlabel%7Bfont%3A%20menu%3B%7D`);
            setTimeout(() => {
                document.getElementById("iframeLoading").style.display = "none";
                document.getElementById("tokenform").style.display = "block";
            }, 2000);
            this.f.ZipFormControl.setValidators([Validators.required, Validators.pattern(Global.ZIP_REGEX)]);
            this.f.ZipFormControl.updateValueAndValidity();
        } else {
            this.IsVirtualPayment = false;
            this.f.creditCardFormControl.reset();
            this.f.refNoFormControl.reset();
            this.f.cashFormControl.reset();
            this.f.checkFormControl.reset();
            localStorage.removeItem('VirtualToken');
            this.DisablePayButton();
            this.f.ZipFormControl.clearValidators();
            this.f.ZipFormControl.updateValueAndValidity();
        }
    }

    DisablePayButton() {
        let VirtualToken: any = localStorage.getItem('VirtualToken');
        if (this.IsVirtualPayment && VirtualToken === "") {
            return true;
        } else if (this.IsVirtualPayment && VirtualToken === undefined) {
            return true;
        }
        else if (this.IsVirtualPayment && VirtualToken === null) {
            return true;
        } else {
            return false;
        }
    }

    onPaymentProfileChange(ev) {
        if (ev.length > 0 && ev[0].value != '') {
            this.ProfileId = ev[0].value;
            const filteredProfileList = this.PaymentProfileList ? this.PaymentProfileList.filter(item => item.Id == ev[0].value)[0] : null;
            const authCode = filteredProfileList ? filteredProfileList.AuthorizationCode : '';
            let authorizeAmount = filteredProfileList ? filteredProfileList.AuthorizeAmount : '';
            this.PaymentSource = filteredProfileList ? filteredProfileList.Sources : '';
            this.f.creditCardFormControl.setValue(authorizeAmount);
            //this.f.creditCardFormControl.disable();
            //this.f.creditCardFormControl.updateValueAndValidity();
            this.onCheckChange(ev);
            this.f.refNoFormControl.setValue(authCode);
            this.f.refNoFormControl.disable();
            this.f.refNoFormControl.updateValueAndValidity();
        } else {
            this.autoSelectSingleOption = false;
            this.f.paymentProfileFormControl.setValue(null);
            this.f.paymentProfileFormControl.clearValidators();
            this.f.paymentProfileFormControl.updateValueAndValidity();
            this.authorizeAmount = 0;
            this.PaymentSource = '';
            this.f.creditCardFormControl.reset();
            this.f.creditCardFormControl.updateValueAndValidity();
            this.onCheckChange(ev);
            this.f.refNoFormControl.setValue(null);
            this.f.refNoFormControl.disable();
            this.f.refNoFormControl.updateValueAndValidity();
        }
    }

    LoadPaymentProfile() {
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectCustomerPaymentProfileByRecordId?RecordId=' + this.RecordId)
            .subscribe(res => {
                if (res) {
                    this.PaymentProfileList = res;
                    if (this.PaymentProfileList.length > 0) {
                        this.f.IsProfilePaymentControl.setValue(true);
                        this.f.IsCloverPaymentControl.setValue('false');
                        this.IsProfilePayment = true;
                        const filteredProfileList = this.PaymentProfileList[0];
                        const authCode = filteredProfileList ? filteredProfileList.AuthorizationCode : '';
                        let authorizeAmount = filteredProfileList ? filteredProfileList.AuthorizeAmount : '';
                        this.PaymentSource = filteredProfileList ? filteredProfileList.Sources : '';
                        this.f.paymentProfileFormControl.setValue(filteredProfileList.Id);
                        this.f.creditCardFormControl.setValue(authorizeAmount);
                        this.f.creditCardFormControl.disable();
                        this.f.creditCardFormControl.updateValueAndValidity();
                        this.onCheckChange(null);
                        this.f.refNoFormControl.setValue(authCode);
                        this.f.refNoFormControl.disable();
                        this.f.refNoFormControl.updateValueAndValidity();
                    }
                } else {
                    this.PaymentProfileList = [];
                    this.ProfileId =null;
                }
            },
                error => (this.ErrorMsg = <any>error));
    }

    CheckedProfilePayment(ev) {
        if (ev.target.checked) {
            this.IsProfilePayment = true;
            this.IsVirtualPayment = false;
            this.f.IsVirtualPaymentControl.setValue(false);
        } else {
            this.IsProfilePayment = false;
            this.f.IsProfilePaymentControl.setValue(false);
            this.f.creditCardFormControl.setValue(null);
            this.f.creditCardFormControl.enable();
            this.f.creditCardFormControl.updateValueAndValidity();
            this.f.refNoFormControl.setValue(null);
            this.f.refNoFormControl.disable();
            this.f.refNoFormControl.updateValueAndValidity();
            this.onCheckChange(null);
        }
    }
}

class CashieringModel {
    cashieringPermitModel: CashieringPermitModel;
    cashieringDMVModel: CashieringDMVModel;
    cashieringPaymentPlanModel: CashieringPaymentPlanModel;
    cashieringPaymentModel: CashieringPaymentModel;
    base64Image: any;
    IsAdminRelease: any;
    RemovePlates: boolean;
    RemovePlatesOption: any;
    RemovePlatesInstruction: any;
    HSN: any;
    IsMultiCardPayment: any;
    IsCloverPayment: boolean;
    ReferenceId: any;
    IsVirtualPayment: boolean;
    Account: any;
    Zip: any;
    ProfileId: any;
    PaymentSource: any;
    RecordId: any;
    eTIMEClearance:boolean;
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
}

class CashieringPaymentPlanModel {
    PaymentPlanDetailsList: CashieringPaymentPlanDetailsModel[];
}

class CashieringPaymentPlanDetailsModel {
    PaymentPlanId: number;
    paymentPlanNo: any;
    amount: number;
    userId: number;
}

class CashieringPermitModel {
    PermitDetailsList: CashieringPermitDetailModel[];
}

class CashieringPermitDetailModel {
    PermitId: number;
    permitNo: any;
    amount: number;
    userId: number;
}

class CashieringPaymentModel {
    CashieringPaymentList: CashieringPaymentDetailsModel[];
}

class CashieringPaymentDetailsModel {
    PermitId: number;
    CitationId: number;
    DMVID: number;
    PaymentPlanId: number;
    TowId: number;
    AuctionBidderId: number;
    AuctionDetailsId: number;
    Cash: number;
    CreditCard: number;
    DebitCard: number;
    RefNo: string;
    Check: number;
    ChequeNo: string;
    TotalPaymentAmout: number;
    TotalPaymentDue: number;
    ChangeAmt: number;
    PaymentDueAmout: number;
    ReceiptNo: string;
    Address: string;
    Phone: number;
    Email: string;
    PaidBy: string;
    FeeDescription: string;
    PaymentType: string;
    UserId: number;
    LicPlate: string;
    State: string;
    CitationNo: string;
    PaymentAmount: string;
    PaymentMethod: string;
    SectionInd: string;

    ReleasedTo: string;
    OwnerId: number;
    OwnerFirstName: string;
    TowCompanyId: number;
}