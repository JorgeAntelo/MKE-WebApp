import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";
import signature from '../../../../assets/js/signature';
declare var $: any

@Component({
    selector: 'app-refund',
    templateUrl: './refund.component.html',
    styleUrls: ['./refund.component.css'],
    providers: []
})
export class RefundComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    @ViewChild('templateSignature') modalSignatureRef: BsModalRef;
    phonemask: any[] = Global.phonemask;
    radioSelected = 'CreditCard';
    RefundForm: FormGroup;
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
    totalRefundAmount = 0;
    ChangeAmt = 0;
    PaymentDue = 0;
    ReceiptNo: string;
    isPaymentSuccess = false;
    PaymentId: number;
    RefundId: number;
    btnRefund = 'Refund';
    CloverPaymentForm: FormGroup;
    CloverGrid: any;
    HasRecords: boolean;
    IsCloverRefund: boolean = false;
    loading: boolean = false;
    grandTotalRefundAmount: any = 0;
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

    total: number = 0;
    subscription1: Subscription;
    NonTerminalTransactionAmount: number = 0;
    TerminalTransactionAmount: number = 0;
    constructor(
        private formBuilder: FormBuilder,
        private modalService: BsModalService,
        private _dataService: DataService,
        private commService: CommunicationService,
        private currencyPipe: CurrencyPipe) {
    }

    ngOnInit(): void {
        this.ErrorMsg = this.SuccessMsg = '';
        this.initForm();
        this.pf.checkNoFormControl.disable();
        this.pf.refNoFormControl.disable();
        this.pf.receiptNoFormControl.disable();
        this.LoadGrid(0);

        this.subscription = this.formData.valueChanges.subscribe(data => {
            this.total = data.reduce((a, b) => a + +b.RefundAmount, 0)
            this.pf.creditCardFormControl.setValue(this.total);

        })
    }

    get f() {
        return this.RefundForm.controls;;
    }

    get pf() { return this.PaymentForm.controls; }

    initForm() {
        this.CloverPaymentForm = this.formBuilder.group({
            fee: [''],
            FeeListArray: this.formBuilder.array([])
        });

        this.RefundForm = this.formBuilder.group({
            paymentReceiptNoFormControl: ['', [Validators.required]]
        });

        this.PaymentForm = this.formBuilder.group({
            cashFormControl: [''],
            creditCardFormControl: [''],
            debitFormControl: [''],
            refNoFormControl: [''],
            checkFormControl: [''],
            checkNoFormControl: [''],
            receiptNoFormControl: [''],
            RefundByFormControl: [''],//, Validators.compose([Validators.required])
            AddressFormControl: [''],
            phoneFormControl: ['', Validators.compose([Validators.pattern(Global.PHONE_REGEX)])],
            emailFormControl: ['', Validators.compose([Validators.pattern(Global.EMAIL_REGEX)])]
        });
    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    onCheckChange(ev) {
        let totalInputPayment = Number(this.pf.cashFormControl.value) + Number(this.pf.creditCardFormControl.value) + Number(this.pf.debitFormControl.value) + Number(this.pf.checkFormControl.value);

        if (this.totalRefundAmount == 0) {
            this.pf.cashFormControl.enable();
            this.pf.creditCardFormControl.enable();
            this.pf.debitFormControl.enable();
            this.pf.checkFormControl.enable();
        }
        else if (totalInputPayment > this.totalRefundAmount) {
            if (Number(this.pf.cashFormControl.value) > 0) {
                this.pf.cashFormControl.enable();
            }
            else {
                this.pf.cashFormControl.disable();
            }
            if (Number(this.pf.creditCardFormControl.value) > 0) {
                this.pf.creditCardFormControl.enable();
            }
            else {
                this.pf.creditCardFormControl.disable();
            }
            if (Number(this.pf.debitFormControl.value) > 0) {
                this.pf.debitFormControl.enable();
            }
            else {
                this.pf.debitFormControl.disable();
            }
            if (Number(this.pf.checkFormControl.value) > 0) {
                this.pf.checkFormControl.enable();
            }
            else {
                this.pf.checkFormControl.disable();
            }
        }
        else if (totalInputPayment == this.totalRefundAmount) {
            if (Number(this.pf.cashFormControl.value) > 0) {
                this.pf.cashFormControl.enable();
            }
            else {
                this.pf.cashFormControl.disable();
            }
            if (Number(this.pf.creditCardFormControl.value) > 0) {
                this.pf.creditCardFormControl.enable();
            }
            else {
                this.pf.creditCardFormControl.disable();
            }
            if (Number(this.pf.debitFormControl.value) > 0) {
                this.pf.debitFormControl.enable();
            }
            else {
                this.pf.debitFormControl.disable();
            }
            if (Number(this.pf.checkFormControl.value) > 0) {
                this.pf.checkFormControl.enable();
            }
            else {
                this.pf.checkFormControl.disable();
            }
        }
        else {
            this.pf.cashFormControl.enable();
            this.pf.creditCardFormControl.enable();
            this.pf.debitFormControl.enable();
            this.pf.checkFormControl.enable();
        }

        let checkValue = this.pf.checkFormControl.value;
        if (checkValue) {
            this.pf.checkNoFormControl.enable();
            this.txtCheckNo.nativeElement.focus();
        } else {
            this.pf.checkNoFormControl.disable();
            this.pf.checkNoFormControl.reset();
        }

        let creditCardValue = this.pf.creditCardFormControl.value;
        let debitCardValue = this.pf.creditCardFormControl.value;
        if (creditCardValue || debitCardValue) {
            this.pf.refNoFormControl.enable();
            this.txtRefNo.nativeElement.focus();
        } else {
            this.pf.refNoFormControl.disable();
            this.pf.refNoFormControl.reset();
        }
        if (this.IsCloverRefund) {
            this.pf.creditCardFormControl.disable();
            this.pf.refNoFormControl.disable();
            this.pf.refNoFormControl.reset();
        }
    }

    search() {
        this.ErrorMsg = this.SuccessMsg = '';
        this.searchsubmitted = true;
        this.totalRefundAmount = 0;
        this.SearchList = [];
        this.SearchMainList = [];
        this.IsChecked = false;
        if (this.RefundForm.invalid) {
            return;
        }
        this.gridLoader = true;

        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SearchByReceiptNo?ReceiptNo=' + this.f.paymentReceiptNoFormControl.value)
            .subscribe(data => {
                if (data.Code > 0) {
                    this.SearchList = data.ResponseData;
                    this.SearchMainList = data.ResponseData;
                    if (this.SearchList.length > 0) {
                        this.CheckCloverRefund();
                        this.pf.RefundByFormControl.setValue(this.SearchList[0].PaidBy);
                        this.pf.AddressFormControl.setValue(this.SearchList[0].Address);
                        this.pf.phoneFormControl.clearValidators();
                        this.pf.phoneFormControl.setValue(this.SearchList[0].Phone);
                        this.pf.phoneFormControl.updateValueAndValidity();
                        this.pf.emailFormControl.setValue(this.SearchList[0].Email);
                        this.LoadGrid(this.SearchList[0].PaymentID);
                    }
                    this.gridLoader = false;
                } else {
                    this.ErrorMsg = data.Message;
                    this.SearchList = [];
                    this.gridLoader = false;
                }

            }, error => {
                this.SearchList = [];
                this.gridLoader = false;
            });
    }

    CheckCloverRefund() {

        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/CheckCloverRefund?PaymentId=' + this.SearchList[0].PaymentID)
            .subscribe(data => {
                if (data > 0) {
                    this.IsCloverRefund = true;
                    this.pf.creditCardFormControl.disable();
                } else {
                    this.IsCloverRefund = false;
                    this.pf.creditCardFormControl.enable();
                    this.pf.creditCardFormControl.updateValueAndValidity();
                }
            }, error => {
                this.IsCloverRefund = false;
                this.pf.creditCardFormControl.enable();
                this.pf.creditCardFormControl.updateValueAndValidity();
            });
    }
    changeRadio(e) {
        this.radioSelected = e.target.value;
        this.pf.debitFormControl.reset();
        this.pf.creditCardFormControl.reset();
        this.pf.refNoFormControl.reset();
        this.onCheckChange('');
    }

    checkAll(ev) {
        this.NonTerminalTransactionAmount = 0;
        this.TerminalTransactionAmount = 0;
        this.totalRefundAmount = 0;
        this.IsChecked = !ev.target.checked;
        this.IsChecked = !this.IsChecked;
        if (ev.target.checked === true) {
            this.SearchList.forEach((item, i) => {
                this.SearchList[i].checked = true;
                this.totalRefundAmount += Number(item.Amount);
            });
        }
        else {
            this.SearchList.forEach((item, i) => {
                this.SearchList[i].checked = false;
            });
        }

        this.grandTotalRefundAmount = this.SearchList.reduce((prevVal, currVal) => {
            return Number(prevVal) + Number(currVal.Amount);
        }, 0);

        let checkedFilter = this.SearchList.filter(x => x.checked == true);
        if (checkedFilter.length == this.SearchList.length) {
            this.IsChecked = true;
        }

        let cloverTotal = 0;
        this.CloverGrid.forEach((item, i) => {
            cloverTotal += Number(item.BalanceAmount);
        });
        this.NonTerminalTransactionAmount = Number(this.grandTotalRefundAmount) - Number(cloverTotal);
        this.TerminalTransactionAmount = Number(cloverTotal);
    }

    getCheckboxValues(i, ev) {
        this.totalRefundAmount = 0;
        this.IsChecked = false;
        this.SearchList[i].checked = ev.target.checked;
        this.calculationNoNCloverTotal();
    }

    calculationNoNCloverTotal(){
        this.NonTerminalTransactionAmount = 0;
        this.TerminalTransactionAmount = 0;
        this.SearchList.forEach((item, i) => {
            if (item.checked == true) {
                this.totalRefundAmount += Number(item.Amount);
            }
        });

        this.grandTotalRefundAmount = this.SearchList.reduce((prevVal, currVal) => {
            return Number(prevVal) + Number(currVal.Amount);
        }, 0);

        let checkedFilter = this.SearchList.filter(x => x.checked == true);
        if (checkedFilter.length == this.SearchList.length) {
            this.IsChecked = true;
        }

        let cloverTotal = 0;
        this.CloverGrid.forEach((item, i) => {
            cloverTotal += Number(item.BalanceAmount);
        });
        this.NonTerminalTransactionAmount = Number(this.grandTotalRefundAmount) - Number(cloverTotal);
        this.TerminalTransactionAmount = Number(cloverTotal);
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

    async makeRefund(ind, index) {
        this.ErrorMsg = this.SuccessMsg = '';
        this.loading = true;
        this.submitted = true;

        if (this.PaymentForm.invalid) {
            // this.alertService.error('Please select seach by seller');
            this.loading = false;
            return;
        }
        if (ind == 'single') {
            
            this.SearchList.forEach((item, i) => {
                this.SearchList[index].checked = false;
            });
            this.totalRefundAmount = 0;
            this.IsChecked = false;
            this.SearchList[index].checked = true;

            this.calculationNoNCloverTotal();

            // this.SearchList.forEach((item, i) => {
            //     if (item.checked == true) {
            //         this.totalRefundAmount += Number(item.Amount);
            //     }
            // });

            let checkedFilter = this.SearchList.filter(x => x.checked == true);
            if (checkedFilter.length == this.SearchList.length) {
                this.IsChecked = true;
            }
        }
        if (this.totalRefundAmount == 0) {
            this.ErrorMsg = 'Payment can not process. Refund grand total is $0.00 ';
            this.loading = false;
            return;
        }
        const cashieringRefundList = [];
        if (this.SearchList.length > 0) {
            this.SearchList.forEach(x => {
                if (x.checked == true) {
                    let payModel: CashieringRefundDetailsModel = new CashieringRefundDetailsModel();
                    payModel.PaymentId = Number(x.PaymentID);
                    payModel.PaymentXrefId = Number(x.PaymentXrefId);
                    payModel.Cash = this.pf.cashFormControl.value;
                    payModel.CreditCard = this.pf.creditCardFormControl.value;
                    payModel.DebitCard = this.pf.debitFormControl.value;
                    payModel.RefNo = this.pf.refNoFormControl.value;
                    payModel.Check = this.pf.checkFormControl.value;
                    payModel.ChequeNo = this.pf.checkNoFormControl.value;
                    payModel.Amount = Number(x.Amount);
                    payModel.GrandTotalAmount = this.totalRefundAmount;
                    payModel.ChangeAmt = this.ChangeAmt;
                    payModel.Address = this.pf.AddressFormControl.value;
                    if (this.pf.phoneFormControl.value) {
                        payModel.Phone = this.pf.phoneFormControl.value.replace("(", "").replace(") ", "").replace("-", "");
                    } else {
                        payModel.Phone = null;
                    }

                    payModel.Email = this.pf.emailFormControl.value;
                    payModel.PaidBy = this.pf.RefundByFormControl.value;
                    payModel.PaymentType = 'Refund';
                    payModel.Notes = '';
                    payModel.UserId = this.UserId;
                    cashieringRefundList.push(payModel);
                }
            });

            const cModel: CashieringRefundModel = new CashieringRefundModel();
            cModel.CashieringRefundList = cashieringRefundList;

            let arrayList: CloverRefundModel[] = this.formData.value;
            if (this.IsCloverRefund) {
                let colverRefundList: any = [];
                arrayList.forEach((element, index) => {
                    let cloverModel: CloverRefundModel = new CloverRefundModel();
                    cloverModel.TransId = element.TransId.toString();
                    cloverModel.BalanceAmount = Number(element.BalanceAmount.replace('$', ''));
                    cloverModel.RefundAmount = Number(element.RefundAmount);
                    colverRefundList.push(cloverModel);
                })
                cModel.CloverRefundList = colverRefundList;
            }

            let totalCount = 0;
            if (this.IsCloverRefund) {
                arrayList.forEach((element, index) => {
                    let balanceamt = element.BalanceAmount.replace('$', '');
                    if (Number(balanceamt) < Number(element.RefundAmount)) {
                        totalCount++;
                    }
                })
            }



            const ele = document.getElementById("sigImageData") as HTMLTextAreaElement;
            if (ele) {
                cModel.base64Image = ele.value;
            } else {
                cModel.base64Image = '';
            }

            if (cModel.CashieringRefundList.length > 0 && !this.isPaymentSuccess) {
                let cashAmt = this.pf.cashFormControl.value;
                let creditCardAmt = this.pf.creditCardFormControl.value;
                let debitCardAmt = this.pf.debitFormControl.value;
                let checkAmt = this.pf.checkFormControl.value;

               

                if (this.NonTerminalTransactionAmount < (Number(cashAmt) + Number(checkAmt))) {
                    this.ErrorMsg = "Cash / Check amount should not be greater than Non-Terminal Transaction Amount.";
                    this.loading = false;
                    return;
                }

                if (totalCount > 0) {
                    this.ErrorMsg = "Refund amount should not be greater than Balance Amount.";
                    this.loading = false;
                    return;
                }

                if (!cashAmt && !creditCardAmt && !debitCardAmt && !checkAmt) {
                    this.ErrorMsg = "Please enter amount in order to proceed";
                    this.loading = false;
                    return;
                }

                if (Number(cashAmt) == 0 && Number(creditCardAmt) == 0 && Number(checkAmt) == 0) {
                    this.ErrorMsg = "Please enter amount in order to proceed";
                    this.loading = false;
                    return;
                }

                // if (Number(cashAmt) + Number(creditCardAmt) + Number(debitCardAmt) + Number(checkAmt) != this.totalRefundAmount) {
                //     this.ErrorMsg = "Please make full payment in order to proceed";
                //     return;
                // }

                if (Number(cashAmt) + Number(creditCardAmt) + Number(debitCardAmt) + Number(checkAmt) > this.totalRefundAmount) {
                    this.ErrorMsg = "Refund Amount is Greater Than Total Fee";
                    this.loading = false;
                    return;
                }

                if (Number(cashAmt) + Number(creditCardAmt) + Number(debitCardAmt) + Number(checkAmt) < this.totalRefundAmount) {
                    this.ErrorMsg = "Refund Amount is Less Than Total Fee";
                    this.loading = false;
                    return;
                }

                if (Number(creditCardAmt) > this.totalRefundAmount) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    this.loading = false;
                    return;
                }
                else if (Number(debitCardAmt) > this.totalRefundAmount) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    this.loading = false;
                    return;
                }
                if (Number(checkAmt) > this.totalRefundAmount) {
                    this.ErrorMsg = "Total non cash amount can't be more than total amount";
                    this.loading = false;
                    return;
                }
                if (checkAmt && Number(checkAmt) > 0 && !this.pf.checkNoFormControl.value) {
                    this.ErrorMsg = "Please enter check #";
                    this.loading = false;
                    return;
                }

                this.ReceiptNo = '';
                this.isPaymentSuccess = false;
                this.btnRefund = 'Processing...'
                this._dataService.post(Global.DLMS_API_URL + 'api/Cashiering/SaveCashieringRefund', cModel).subscribe(result => {
                    if (result.RefundId > 0) {
                        this.btnRefund = 'Refund'
                        this.SuccessMsg = result.Message;
                        this.ReceiptNo = result.ReceiptNo;
                        this.RefundId = result.RefundId;
                        this.isPaymentSuccess = true;
                        this.PaymentForm.reset();
                        this.pf.receiptNoFormControl.setValue(result.ReceiptNo);
                        this.submitted = false;
                        this.totalRefundAmount = 0;
                        this.IsCloverRefund = false;
                        this.loading = false;
                    }
                    else if (result.RefundId == -2) {
                        this.ErrorMsg = "Can't process the refund. Please contact administrator";
                        this.btnRefund = 'Refund'
                        this.ReceiptNo = result.ReceiptNo;
                        this.loading = false;
                    }
                    else {
                        this.ErrorMsg = result.Message;
                        this.btnRefund = 'Refund'
                        this.loading = false;
                    }
                },
                    error => {
                        this.ErrorMsg = <any>error;
                        this.ReceiptNo = '';
                        this.isPaymentSuccess = false;
                        this.btnRefund = 'Refund'
                        this.loading = false;
                    });
            }
        }
    }

    printReceipt() {
        window.open('' + Global.ZebraPrintReportPath + '?reportName=RefundReceipt&showpdf=false&rendertopdf=false&RefundId=' + this.RefundId, '_blank');
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

        this.totalRefundAmount = 0;
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

    LoadGrid(PaymentID): void {
        const control = <FormArray>this.CloverPaymentForm.controls['FeeListArray'];
        control.controls = [];
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectCloverPaymentList?PaymentId=' + PaymentID)
            .subscribe(res => {
                if (res) {
                    this.CloverGrid = res;
                    if (this.CloverGrid.length > 0) {
                        this.HasRecords = true;
                        const control = <FormArray>this.CloverPaymentForm.controls['FeeListArray'];
                        control.controls = [];
                        this.CloverGrid.forEach((element, index) => {
                            control.push(this.createItem(
                                this.CloverGrid[index]['TransId'],
                                this.CloverGrid[index]['AuthorizationCode'],
                                this.CloverGrid[index]['CardNumber'],
                                this.CloverGrid[index]['CardBrand'],
                                this.CloverGrid[index]['AmountCaptured'],
                                this.CloverGrid[index]['BalanceAmount']
                            ));
                        });
                    } else {
                        this.CloverGrid = [];
                    }
                } else {
                    this.CloverGrid = [];
                }
            },
                error => (this.ErrorMsg = <any>error));
    }
    createItem(TransId, AuthorizationCode, CardNumber, CardBrand, AmountCaptured, BalanceAmount) {
        return this.formBuilder.group({
            TransId: new FormControl(TransId),
            AuthorizationCode: new FormControl(AuthorizationCode),
            CardNumber: new FormControl('XXXXXXXXXX' + CardNumber),
            CardBrand: new FormControl(CardBrand),
            AmountCaptured: new FormControl(this.currencyFormat(AmountCaptured)),
            BalanceAmount: new FormControl(this.currencyFormat(BalanceAmount)),
            RefundAmount: new FormControl('')
        });
    }

    currencyFormat(amount) {
        if (amount) {
            return this.currencyPipe.transform(amount);
        } else {
            return this.currencyPipe.transform(0);
        }
    }

    isPaymentVisible() {
        return true;
    }
    get formData() {
        return <FormArray>this.CloverPaymentForm.get('FeeListArray');
    }

    isHideByDescription(categoryId: string) {
        if (categoryId == '-1') {
            return false;
        }
        else {
            return true;
        }
    }
}

class CashieringRefundModel {
    CashieringRefundList: CashieringRefundDetailsModel[];
    base64Image: any;
    CloverRefundList: CloverRefundModel[];
}

class CashieringRefundDetailsModel {
    PaymentId: number;
    PaymentXrefId: number;
    Cash: number;
    CreditCard: number;
    DebitCard: number;
    RefNo: string;
    Check: number;
    ChequeNo: string;
    Amount: number;
    GrandTotalAmount: number;
    ChangeAmt: number;
    Address: string;
    Phone: number;
    Email: string;
    PaidBy: string;
    PaymentType: string;
    Notes: string;
    UserId: number;
}

class CloverRefundModel {
    TransId: string;
    // AuthorizationCode: string;
    // CardNumber: string;
    // CardBrand: string;
    // AmountCaptured: string;
    BalanceAmount: any;
    RefundAmount: number;
}