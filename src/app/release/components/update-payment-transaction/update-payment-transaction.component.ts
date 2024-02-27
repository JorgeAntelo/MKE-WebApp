import { Component, OnInit, Input, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { DatePipe } from '@angular/common';
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";
import signature from '../../../../assets/js/signature';
declare var $: any

@Component({
    selector: 'app-update-payment',
    templateUrl: './update-payment-transaction.component.html',
    styleUrls: ['./update-payment-transaction.component.css']
})
export class UpdatePaymentTransactionComponent implements OnInit {

    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild('templateSignature') modalSignatureRef: BsModalRef;
    phonemask: any[] = Global.phonemask;
    radioSelected = 'CreditCard';
    TowId = 0;
    MainReleaseToList = [];
    ReleaseToList = [];
    CompanyList = [];
    ReleaseToNameList = [];
    showNameText = false;
    isAdministrativeRelease = false;
    isTowCompanyRelease = false;
    loading = false;
    SearchForm: FormGroup;
    PaymentForm: FormGroup;
    SearchList = [];
    SearchMainList = [];
    ErrorMsg: string;
    SuccessMsg: string;
    UserId: number;
    submitted = false;
    searchsubmitted = false;
    gridLoader = false;
    IsChecked = false;
    IsCheckedTowFee = false;
    totalAmount = 0;
    ChangeAmt = 0;
    PaymentDue = 0;
    ReceiptNo: string;
    isPaymentSuccess = false;
    IsCheckedRefused = false;
    PaymentId: number;
    RefundId: number;
    btnRefund = 'Update';
    SelectedTowCompanyid: number = null;
    SelectedTowCompany: string = null;
    TotalPaymentAmout = 0;
    // component communication
    @Input('userId')
    set userId(data: any) {
        if (data) {
            this.UserId = Number(data);
        }
    }

    subscription: Subscription;
    @ViewChild('txtRefNo') txtRefNo: ElementRef;
    @ViewChild('txtCheckNo') txtCheckNo: ElementRef;
    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        private commService: CommunicationService) {
    }

    ngOnInit(): void {
        this.ErrorMsg = this.SuccessMsg = '';
        this.initForm();
        this.f.checkNoFormControl.disable();
        this.f.refNoFormControl.disable();
        this.LoadReleaseTo();
        this.LoadCompany();
    }

    get sf() {
        return this.SearchForm.controls;;
    }

    get f() { return this.PaymentForm.controls; }

    initForm() {
        this.SearchForm = this.formBuilder.group({
            paymentReceiptNoFormControl: ['', [Validators.required]]
        });

        this.PaymentForm = this.formBuilder.group({
            cashFormControl: [{ value: '', disabled: false }],
            creditCardFormControl: [{ value: '', disabled: false }],
            refNoFormControl: [{ value: '', disabled: false }],
            checkFormControl: [{ value: '', disabled: false }],
            checkNoFormControl: [{ value: '', disabled: false }],
            PaidByFormControl: [''],// , Validators.compose([Validators.required])
            AddressFormControl: [''],
            phoneFormControl: ['', Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])],
            emailFormControl: ['', Validators.compose([Validators.pattern(Global.EMAIL_REGEX)])],
            releaseToFormControl: ['', Validators.compose([Validators.required])],
            towCompanyFormControl: ['', Validators.compose([Validators.required])],
            releaseToNameFormControl: ['', Validators.compose([Validators.required])],
            releaseToNameTxtFormControl: ['', Validators.compose([Validators.required])],
            IsAdminReleaseControl: ['false', Validators.compose([Validators.required])]
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    search() {
        this.PaymentForm.reset();
        this.ErrorMsg = this.SuccessMsg = '';
        this.searchsubmitted = true;
        this.SearchList = [];
        this.SearchMainList = [];
        this.IsChecked = false;
        if (this.SearchForm.invalid) {
            return;
        }
        this.gridLoader = true;

        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetReceiptDetailsByReceiptNo?ReceiptNo=' + this.sf.paymentReceiptNoFormControl.value)
            .subscribe(data => {
                if (data.Code > 0) {
                    this.SearchList = data.ResponseData;;
                    this.SearchMainList = data.ResponseData;
                    if (this.SearchList.length > 0) {
                        this.loadForm();
                    }
                }else {
                    this.ErrorMsg = data.Message;
                    this.SearchList = [];
                }
                this.gridLoader = false;
            }, error => {
                console.log(error);
                this.SearchList = [];
                this.TowId = 0;
                this.gridLoader = false;
            });
    }

    loadForm() {
        let data = this.SearchList[0];
        this.PaymentId = data.PaymentID;
        this.ReceiptNo = data.ReceiptNo;
        this.totalAmount = data.TotalPaymentAmout;
        this.ChangeAmt = data.ChangeAmt;
        this.PaymentDue = data.TotalPaymentDue;
        this.TotalPaymentAmout = data.TotalPaymentAmout;
        this.TowId = data.TowId;
        this.f.cashFormControl.setValue(Number(data.Cash) == 0 ? null : Number(data.Cash));
        this.f.creditCardFormControl.setValue(Number(data.CreditCard) == 0 ? null : Number(data.CreditCard));
        this.f.refNoFormControl.setValue(data.RefNo);
        this.f.checkFormControl.setValue(Number(data.Check) == 0 ? null : Number(data.Check));
        this.f.checkNoFormControl.setValue(data.ChequeNo);

        if (this.TowId > 0) {
            if (data.IsAdminRelease == 'Yes') {
                this.isAdministrativeRelease = true;
                this.f.cashFormControl.disable();
                this.f.creditCardFormControl.disable();
                this.f.checkFormControl.disable();
            } else {
                this.isAdministrativeRelease = false;
                this.f.cashFormControl.enable();
                this.f.creditCardFormControl.enable();
                this.f.checkFormControl.enable();
            }
            this.f.IsAdminReleaseControl.setValue(data.IsAdminRelease);
            this.f.releaseToFormControl.setValue(this.ReleaseTypeCode(data.ReleasedTo));
            this.onReleaseToChange();
            this.f.towCompanyFormControl.setValue(null);
            this.f.releaseToNameTxtFormControl.setValue(data.OwnerFirstName);
            if (!this.showNameText && !this.isAdministrativeRelease && !this.isTowCompanyRelease) {
                this.onNameChange();
                this.f.releaseToNameFormControl.setValue(data.OwnerId);
            }
        } else {
            this.f.PaidByFormControl.setValue(data.PaidBy);

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
        this.f.emailFormControl.setValue(data.Email);
        this.f.AddressFormControl.setValue(data.Address);
        this.f.phoneFormControl.setValue(data.Phone);
        const chkRefused = document.getElementById("chkRefused") as HTMLInputElement;
        if (data.Phone) {
            this.IsCheckedRefused = false;
            this.f.phoneFormControl.setValidators([Validators.required]);
            this.f.phoneFormControl.updateValueAndValidity();
            chkRefused.checked = false;
        } else {
            this.IsCheckedRefused = true;
            this.f.phoneFormControl.clearValidators();
            this.f.phoneFormControl.updateValueAndValidity();
            chkRefused.checked = true;
        }
    }

    onCheckChange() {
        let totalInputPayment = Number(this.f.cashFormControl.value) + Number(this.f.creditCardFormControl.value) + Number(this.f.checkFormControl.value);
        this.PaymentDue = (this.TotalPaymentAmout - totalInputPayment) > 0 ? this.TotalPaymentAmout - totalInputPayment : 0;
        this.ChangeAmt = (totalInputPayment - this.TotalPaymentAmout) > 0 ? totalInputPayment - this.TotalPaymentAmout : 0;
        if (this.TotalPaymentAmout == 0) {
            this.f.cashFormControl.enable();
            this.f.creditCardFormControl.enable();
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
        this.f.releaseToNameFormControl.clearValidators();
        this.f.releaseToNameFormControl.updateValueAndValidity();
        if (creditCardValue) {
            this.f.refNoFormControl.enable();
            this.f.refNoFormControl.setValidators([Validators.required]);
            this.f.refNoFormControl.updateValueAndValidity();
            this.txtRefNo.nativeElement.focus();
        } else {
            this.f.refNoFormControl.disable();
            this.f.refNoFormControl.clearValidators();
            this.f.refNoFormControl.updateValueAndValidity();
            this.f.refNoFormControl.reset();
        }
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

    onReleaseToChange() {
        this.showNameText = false;
        this.isTowCompanyRelease = false;
        // this.isAdministrativeRelease = false;
        this.f.AddressFormControl.setValue('', { onlySelf: true });

        let selectedOption = this.f.releaseToFormControl.value;

        //const option = ev.target.selectedOptions[0].label;
        let option = this.ReleaseToList.filter(x => x.Id == Number(selectedOption))[0];

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

        let creditCard = document.getElementById('CreditCard') as HTMLInputElement;
        if (creditCard) {
            creditCard.disabled = false;
        }

        switch (option.ReleasedTo) {
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
                // this.isAdministrativeRelease = true;
                this.f.releaseToNameTxtFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                this.enableDisableControles(false);
                this.f.releaseToNameTxtFormControl.enable();
                this.f.cashFormControl.reset();
                this.f.creditCardFormControl.reset();
                this.f.refNoFormControl.reset();
                this.f.checkFormControl.reset();
                this.f.checkNoFormControl.reset();

                this.f.cashFormControl.setValue(null);
                this.f.creditCardFormControl.setValue(null);
                this.f.refNoFormControl.setValue(null);
                this.f.checkFormControl.setValue(null);
                this.f.checkNoFormControl.setValue(null);

                this.f.cashFormControl.disable();
                this.f.creditCardFormControl.disable();
                this.f.checkFormControl.disable();
                creditCard.disabled = true;
                break;
            case 'Lien':
            case 'Owner':
                this.showNameText = false;
                // this.isAdministrativeRelease = false;
                this.isTowCompanyRelease = false;
                this.enableDisableControles(true);
                this.f.towCompanyFormControl.setValue(0, { onlySelf: true });
                this.f.releaseToNameFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.clearValidators();
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
                this.f.releaseToNameFormControl.updateValueAndValidity();
                this.f.AddressFormControl.disable();
                break;
            case 'Other':
                this.showNameText = true;
                this.f.releaseToNameTxtFormControl.setValidators([Validators.required]);
                this.f.releaseToNameTxtFormControl.updateValueAndValidity();
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
        this.ReleaseToName(this.TowId, this.ReleaseType(Number(option.Id)));
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

    onNameChange() {
        const i = this.ReleaseToNameList.findIndex(k => k.Id === Number(this.f.releaseToNameFormControl.value));
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

    private ReleaseTypeCode(Code) {
        if (Code === 'O') {
            return 1;
        } else if (Code === 'L') {
            return 2;
        } else if (Code === 'I') {
            return 3;
        } else if (Code === 'R') {
            return 4;
        } else if (Code === 'T') {
            return 7;
        } else if (Code === 'A') {
            return 5;
        }
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

    onTowCompanyChange(ev) {
        var towCompanyId: any = ev.target.value;
        let val = this.CompanyList.filter(x => Number(x.TowCompanyId) == Number(towCompanyId));
        this.f.AddressFormControl.setValue(val[0].CompleteAddress);
        this.SelectedTowCompanyid = val[0].TowCompanyId;
        this.SelectedTowCompany = val[0].TowCompanyName;
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

    checkAll(ev) {
        this.totalAmount = 0;
        this.IsChecked = !ev.target.checked;
        this.IsChecked = !this.IsChecked;
        if (ev.target.checked === true) {
            this.SearchList.forEach((item, i) => {
                this.SearchList[i].checked = true;
                this.totalAmount += Number(item.Amount);
            });
        }
        else {
            this.SearchList.forEach((item, i) => {
                this.SearchList[i].checked = false;
            });
        }
    }

    getCheckboxValues(i, ev) {
        this.totalAmount = 0;
        this.IsChecked = false;
        this.SearchList[i].checked = ev.target.checked;

        this.SearchList.forEach((item, i) => {
            if (item.checked == true) {
                this.totalAmount += Number(item.Amount);
            }
        });

        let checkedFilter = this.SearchList.filter(x => x.checked == true);
        if (checkedFilter.length == this.SearchList.length) {
            this.IsChecked = true;
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

    changeAdminReleaseRadio(e) {
        if (e.target.value == 'Yes') {
            this.isAdministrativeRelease = true;
            this.f.cashFormControl.reset();
            this.f.creditCardFormControl.reset();
            this.f.refNoFormControl.reset();
            this.f.checkFormControl.reset();
            this.f.checkNoFormControl.reset();

            this.f.cashFormControl.setValue(null);
            this.f.creditCardFormControl.setValue(null);
            this.f.refNoFormControl.setValue(null);
            this.f.checkFormControl.setValue(null);
            this.f.checkNoFormControl.setValue(null);

            this.f.cashFormControl.disable();
            this.f.creditCardFormControl.disable();
            this.f.checkFormControl.disable();
        } else {
            this.f.cashFormControl.enable();
            this.f.creditCardFormControl.enable();
            this.f.checkFormControl.enable();
            this.isAdministrativeRelease = false;
        }
    }

    async updatePaymentTrans() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.submitted = true;
        if (this.PaymentForm.invalid) {
            return;
        }

        if (!this.isAdministrativeRelease && this.TotalPaymentAmout == 0) {
            this.ErrorMsg = 'Payment can not process. Total payment due is $0.00 ';
            return;
        }

        let payModel: UpdatePaymentDetailsModel = new UpdatePaymentDetailsModel();
        if (this.SearchList.length > 0) {
            payModel.Cash = this.isAdministrativeRelease == true ? null : this.f.cashFormControl.value;
            payModel.CreditCard = this.isAdministrativeRelease == true ? null : this.f.creditCardFormControl.value;
            payModel.RefNo = this.isAdministrativeRelease == true ? null : this.f.refNoFormControl.value;
            payModel.Check = this.isAdministrativeRelease == true ? null : this.f.checkFormControl.value;
            payModel.ChequeNo = this.isAdministrativeRelease == true ? null : this.f.checkNoFormControl.value;
            payModel.TotalPaymentAmount = this.isAdministrativeRelease == true ? 0 : this.TotalPaymentAmout;
            payModel.TotalPaymentDue = this.isAdministrativeRelease == true ? 0 : this.PaymentDue;
            payModel.ChangeAmt = this.isAdministrativeRelease == true ? 0 : this.ChangeAmt;
            payModel.PaymentDueAmount = this.isAdministrativeRelease == true ? 0 : Number(this.SearchList[0].TotalPaymentDue);
            payModel.PaymentId = this.SearchList[0].PaymentID;
            payModel.TowId = this.TowId;
            payModel.Address = this.f.AddressFormControl.value;
            if (this.f.phoneFormControl.value) {
                payModel.Phone = this.f.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
            } else {
                payModel.Phone = null;
            }
            payModel.Email = this.f.emailFormControl.value;
            payModel.PaidBy = this.f.PaidByFormControl.value;
            payModel.UserId = this.UserId;
            payModel.ReceiptNo = this.ReceiptNo;
            payModel.ReleasedTo = this.ReleaseType(Number(this.f.releaseToFormControl.value));
            payModel.OwnerId = this.f.releaseToNameFormControl.value;
            if (this.f.releaseToNameTxtFormControl.value) {
                payModel.OwnerFirstName = String(this.f.releaseToNameTxtFormControl.value).trim();
            } else {
                if (this.ReleaseToNameList.length > 0) {
                    const i = this.ReleaseToNameList.findIndex(k => k.Id === payModel.OwnerId);
                    payModel.OwnerFirstName = this.ReleaseToNameList[i].Name;
                }
            }
        }

        const ele = document.getElementById("sigImageData") as HTMLTextAreaElement;
        if (ele) {
            payModel.base64Image = ele.value;
        } else {
            payModel.base64Image = '';
        }
        //payModel.IsAdminRelease = this.f.IsAdminReleaseControl.value;

        let cashAmt = this.f.cashFormControl.value;
        let creditCardAmt = this.f.creditCardFormControl.value;
        let checkAmt = this.f.checkFormControl.value;

        if (!this.isAdministrativeRelease) {
            if (!cashAmt && !creditCardAmt && !checkAmt) {
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
                this.loading = false;
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
        }
        this.loading = true;
        this.isPaymentSuccess = false;
        this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/UpdatePaymentDetails', payModel).subscribe(result => {
            if (result.PaymentId > 0) {
                this.SuccessMsg = 'Success';
                // this.ReceiptNo = result.ReceiptNo;
                // this.PaymentId = result.PaymentId;
                this.isPaymentSuccess = true;
                this.printReceipt();
                // this.PaymentForm.reset();
                this.submitted = false;
                this.loading = false;
            } else {
                this.ErrorMsg = 'Failure';
                this.loading = false;
            }
        },
            error => {
                this.ErrorMsg = <any>error;
                // this.ReceiptNo = '';
                this.isPaymentSuccess = false;
                this.loading = false;
            });

    }

    getPaymentMethod() {
        let cashAmt = Number(this.f.cashFormControl.value) > 0 ? ' CASH ' : '';
        let creditCardAmt = Number(this.f.creditCardFormControl.value) > 0 ? ' CREDIT_CARD ' : '';
        let checkAmt = Number(this.f.checkFormControl.value) > 0 ? ' CHECK ' : '';

        return cashAmt + creditCardAmt + checkAmt;
    }

    printReceipt() {
        if (this.TowId > 0) {
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

    filterCitation(ev) {
        switch (ev.target.value) {
            case 'TowFee':
                if (ev.target.checked) {
                    this.SearchList = this.SearchMainList.filter(x => Number(x.TowId) > 0
                        && Number(x.DMVID) == 0
                        && Number(x.PermitId) == 0
                        && Number(x.CitationId) == 0);
                } else {
                    this.SearchList = this.SearchMainList;
                }
                break;
            default:
                this.SearchList = this.SearchMainList;
                break;
        }

        let checkboxes = document.getElementsByName('A');

        Array.from(checkboxes).forEach((item) => {
            if (item !== ev.target) {
                item["checked"] = false;
            }
        });

        this.totalAmount = 0;
        this.IsChecked = false;
        this.SearchList.forEach((item, i) => {
            this.SearchList[i].checked = false;
        });
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
            let value = document.getElementById("hfCloseInd").innerText;
            if (value != "Failure") {
                this.closeSignatureModal();
            }
        }
    }
}

class UpdatePaymentDetailsModel {
    PaymentId: number;
    TowId: number;
    Cash: number;
    CreditCard: number;
    RefNo: string;
    Check: number;
    ChequeNo: string;
    TotalPaymentAmount: number;
    TotalPaymentDue: number;
    ChangeAmt: number;
    PaymentDueAmount: number;
    ReceiptNo: string;
    ReleasedTo: string;
    OwnerId: number;
    OwnerFirstName: string;

    Address: string;
    Phone: number;
    Email: string;
    PaidBy: string;
    UserId: number;
    base64Image: string;
    IsAdminRelease: string;
}