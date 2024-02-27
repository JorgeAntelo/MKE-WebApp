import { Component, OnInit, Output, EventEmitter, Input, ViewChild, TemplateRef } from "@angular/core";
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Global } from "src/app/shared/global";
import { DataService } from "src/app/core/services/data.service";
import { CommunicationService } from "src/app/core/services/app.communication.service";
import { Subscription } from "rxjs";
import { DatePipe } from '@angular/common';
declare var $: any

@Component({
    selector: 'app-citations',
    templateUrl: './citations.component.html',
    styleUrls: ['./citations.component.css'],
    providers: []
})
export class CitationsComponent implements OnInit {
    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    AddBtn: string;
    IsNameSearch = false;
    ciDetails: any;
    phonemask: any[] = Global.phonemask;
    citationInfoList = [];
    citationMainInfoList = [];
    citationInfo: any;
    CitationTowEligibleCounts = [];
    citationTowEligible: any;
    CIDataList = [];
    PermitId = 0;
    MessageType: string;
    Message: string;
    ErrorMsg: string;
    SuccessMsg: string;
    UserId: number;
    totalOfCitations = 0;
    totalPaymentDue = 0;
    gridLoader = false;
    IsChecked = false;
    IsCheckedUnpaid = true;
    sortBy = 'ISSUEDATE'
    sortOrder = 'desc'
    // component communication
    @Output() citationsData: EventEmitter<any> = new EventEmitter<any>();
    PaidCitationList: any;
    @Input('cartScreenData')
    set cartScreenData(data: any) {
        if (data) {
            this.citationInfoList = [];
            this.citationInfo = null;
            if (data.searchType == 'N') {
                this.IsNameSearch = true;
            }
            else {
                this.IsNameSearch = false;
            }
            if (this.VehicleStatus != 'Released') {
                switch (String(data.searchType).toUpperCase()) {
                    case "P":
                        if (data.licensePlate) {
                            let vinNo = '';
                            if (data.vinNo) {
                                vinNo = data.vinNo;
                            }
                            this.getCitations(String(data.licensePlate).toUpperCase(), String(data.state).toUpperCase(), String(data.searchType).toUpperCase(), String(data.citationNo).toUpperCase(), String(data.firstName).toUpperCase(), String(data.lastName).toUpperCase(), String(vinNo).toUpperCase());
                        }
                        break;
                    case "C":
                    case "N":
                    case "V":
                        let vinNo = '';
                        if (data.vinNo) {
                            vinNo = data.vinNo;
                        }
                        this.getCitations(String(data.licensePlate).toUpperCase(), String(data.state).toUpperCase(), String(data.searchType).toUpperCase(), String(data.citationNo).toUpperCase(), String(data.firstName).toUpperCase(), String(data.lastName).toUpperCase(), String(vinNo).toUpperCase());
                        break;
                }
            }
        }
    }

    @Input('userId')
    set userId(data: any) {
        if (data) {
            this.UserId = Number(data);
        }
    }

    VehicleStatus: string;
    @Input('vehicleStatus')
    set vehicleStatus(data: any) {
        if (data) {
            this.VehicleStatus = String(data);
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

    @ViewChild('templateCitationDetails') modaltemplateCitationDetailsRef: BsModalRef;
    @ViewChild('templateVioLatefeeDetails') modaltemplateVioLatefeeDetailsRef: BsModalRef;

    subscription: Subscription;
    constructor(
        private modalService: BsModalService,
        private _dataService: DataService,
        private commService: CommunicationService,
        private datePipe: DatePipe) {

        this.subscription = this.commService.getClearCashiering().subscribe(res => {
            if (res) {
                this.citationInfoList = [];
                this.citationInfo = null;
                this.ErrorMsg = this.SuccessMsg = '';
                this.totalPaymentDue = 0;
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
                if (typeof res.deleteCartItem.Type != 'undefined' && res.deleteCartItem.Type == 'Citation') {
                    this.DeletedRowsFromCart(res.deleteCartItem);
                }
            }
        });
    }

    ngOnInit(): void {

    }

    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }

    AddToCart() {
        this.totalOfCitations = 0;
        this.CIDataList = [];
        this.ErrorMsg = this.SuccessMsg = '';
        this.citationInfoList.forEach((item, i) => {
            if (item.checked == true && Number(item.AMOUNTDUE) > 0) {
                this.totalOfCitations += Number(item.AMOUNTDUE);
                this.CIDataList.push(item);
                this.SaveAddtoCart(item.ISSUENO, item.AMOUNTDUE)
            }
        });
        if (this.CIDataList.length > 0) {
            let citations = {
                'totalofCitations': this.totalOfCitations,
                'CIData': this.CIDataList
            }
            switch (this.ParentScreenName) {
                case 'Cashiering':
                    this.commService.sendCitationsData(citations);
                    this.SuccessMsg = 'Added to cart';
                    setTimeout(() => {
                        this.SuccessMsg = this.ErrorMsg = '';
                    }, 3000);
                    break;
                case 'Disposition':
                    this.commService.sendCitationsDataToDisposition(citations);
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
        }
        else {
            this.ErrorMsg = 'Please select atleast one citation';
            setTimeout(() => {
                this.SuccessMsg = this.ErrorMsg = '';
            }, 3000);
        }

    }

    SaveAddtoCart(ISSUENO, Amount) {
        let ReferenceId = this.ParentScreenName == 'Disposition' ? localStorage.getItem('TowId') : localStorage.getItem('CashierSequenceNo');
        let model: AddToCart = {
            LicensePlate: '',
            Permit: '',
            PaymentPlan: '',
            FeeName: '',
            CitationNo: ISSUENO,
            State: '',
            Amount: Amount,
            CartType: 'Citation',
            ReferenceId: ReferenceId,
            UserId: this.UserId
        }
        this._dataService
            .post(Global.DLMS_API_URL + 'api/Disposition/SaveAddToCartItem', model)
            .subscribe(response => {
                if (response.Code > 0) { }
            });
    }

    print(permitId) {
        window.open('' + Global.ZebraPrintReportPath + '?reportName=PermitApplication&showpdf=false&rendertopdf=false&PermitId=' + permitId, '_blank');
    }

    getCitations(plate = '', state = '', searchType = '', citationNo = '', firstName = '', lastName = '', vin = '') {
        let checkboxes = document.getElementsByName('Citation');
        Array.from(checkboxes).forEach((item) => {
            item["checked"] = false;
        });
        this.gridLoader = true;
        this.citationInfoList = [];
        this.citationInfo = null;
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetCitations?plate=' + plate + '&state=' + state + '&searchType=' + searchType + '&citationNo=' + citationNo + '&firstName=' + firstName + '&lastName=' + lastName + '&VIN=' + vin)
            .subscribe(result => {
                if (result.dataSet) {
                    this.citationInfoList = result.dataSet.Table;
                    this.citationMainInfoList = result.dataSet.Table;
                    // console.log(this.citationInfoList);
                    this.ErrorMsg = result.Message;
                    if (this.citationInfoList.length > 0) {
                        this.getPaidCitationList();
                        const ele = document.getElementById("chkUnpaid") as HTMLInputElement;
                        ele.checked = true;
                        this.citationInfo = this.citationInfoList[0];
                        this.citationInfoList.forEach((item, i) => {
                            // this.totalOfCitations += Number(item.AMOUNTDUE);
                            this.citationInfoList[i].checked = false;
                            if (this.ParentScreenName == 'Disposition') {
                                this.citationInfoList[i].Description = item.ISSUENO + ' ' + item.LICPLATE + ' ' + item.LICSTATEPROV;
                            } else {
                                this.citationInfoList[i].Description = 'Citations';
                            }
                        });

                        if (this.IsCheckedUnpaid == true) {
                            this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) > 0);
                            this.getCitationTowEligibleCounts(this.citationInfoList);
                            if (this.ParentScreenName == 'SearchTow') {
                                document.getElementById("IsSelecteAllControl").click();
                            }
                        } else {
                            this.citationInfoList = this.citationMainInfoList;
                            this.getCitationTowEligibleCounts(this.citationInfoList);
                        }
                    }
                    this.gridLoader = false;
                } else {
                    this.citationInfoList = [];
                    this.citationInfo = null;
                    this.gridLoader = false;
                    this.ErrorMsg = result.Message;
                }
                if (this.citationInfoList.length > 0) {
                    this.citationsData.emit({
                        'totalCitationFee': 0,
                        'PermitId': 0,
                        'CitationId': 0,
                        'DMVID': 0,
                        'PaymentPlanId': 0,
                        'CIData': this.CIDataList
                    });
                }
            },
                error => {
                    this.ErrorMsg = <any>error;
                    this.gridLoader = false;
                });
    }

    filterCitation(ev) {
        let selectedCheckBoz = ev.target.value;
        if (selectedCheckBoz == 'Paid' && ev.target.checked) {
            this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) == 0);

            this.getCitationTowEligibleCounts(this.citationInfoList);
        } else if (selectedCheckBoz == 'All' && ev.target.checked) {
            this.citationInfoList = this.citationMainInfoList;

            this.getCitationTowEligibleCounts(this.citationInfoList);
        }
        else if (selectedCheckBoz == 'Unpaid' && !ev.target.checked) {
            this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) > 0);
            this.getCitationTowEligibleCounts(this.citationInfoList);
        }
        else {
            this.IsCheckedUnpaid = true;
            this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) > 0);

            this.getCitationTowEligibleCounts(this.citationInfoList);
        }

        let checkboxes = document.getElementsByName('Citation');
        Array.from(checkboxes).forEach((item) => {
            if (item !== ev.target) {
                item["checked"] = false;
                if ((ev.target.value == 'Paid' || ev.target.value == 'Unpaid' || ev.target.value == 'All') && !ev.target.checked) {
                    const ele = document.getElementById("chkUnpaid") as HTMLInputElement;
                    ele.checked = true;
                }
            }
        });

        this.totalPaymentDue = 0;
        this.IsChecked = false;
        this.citationInfoList.forEach((item, i) => {
            this.citationInfoList[i].checked = false;
        });

        if (this.ParentScreenName == 'SearchTow') {
            let summeryData = {
                'totalofCitations': this.totalPaymentDue
            }
            this.commService.sendHomeSearchSummeryData(summeryData);
        }
    }

    viewDetails(template: TemplateRef<any>, item) {
        this.ciDetails = item;
        this.modaltemplateCitationDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
    }

    closeCitationDetailsRef() {
        this.modaltemplateCitationDetailsRef.hide();
    }

    viewVioLatefeeDetails(template: TemplateRef<any>, item) {
        this.ciDetails = item;
        this.modaltemplateVioLatefeeDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    }

    closeVioLatefeeDetailsRef() {
        this.modaltemplateVioLatefeeDetailsRef.hide();
    }

    checkAll(ev) {
        this.totalPaymentDue = 0;
        this.IsChecked = !ev.target.checked;
        this.IsChecked = !this.IsChecked;
        if (ev.target.checked === true) {
            this.citationInfoList.forEach((item, i) => {
                this.citationInfoList[i].checked = true;
                this.totalPaymentDue += Number(item.AMOUNTDUE);
            });
        }
        else {
            this.citationInfoList.forEach((item, i) => {
                this.citationInfoList[i].checked = false;
            });
        }
        if (this.ParentScreenName == 'SearchTow') {
            let summeryData = {
                'totalofCitations': this.totalPaymentDue
            }
            this.commService.sendHomeSearchSummeryData(summeryData);
        }
    }

    getCheckboxValues(item, ev) {
        this.totalPaymentDue = 0;
        this.IsChecked = false;
        const index = this.citationInfoList.indexOf(item);
        this.citationInfoList[index].checked = ev.target.checked;

        this.citationInfoList.forEach((element) => {
            if (element.checked == true) {
                this.totalPaymentDue += Number(element.AMOUNTDUE);
            }
        });

        let checkedFilter = this.citationInfoList.filter(x => x.checked == true);
        if (checkedFilter.length == this.citationInfoList.length) {
            this.IsChecked = true;
        }
        if (this.ParentScreenName == 'SearchTow') {
            let summeryData = {
                'totalofCitations': this.totalPaymentDue
            }
            this.commService.sendHomeSearchSummeryData(summeryData);
        }
    }

    DeletedRowsFromCart(deleteCartItem) {
        let index = this.citationInfoList.findIndex(item => item.ISSUENO === deleteCartItem.CitationNo && item.checked === true);
        let citations = {
            'totalofCitations': this.totalOfCitations,
            'CIData': []
        }
        if (index >= 0) {
            this.totalPaymentDue = 0;
            this.IsChecked = false;
            this.citationInfoList[index].checked = false;

            this.citationInfoList.forEach((item, i) => {
                if (item.checked == true) {
                    this.totalPaymentDue += Number(item.AMOUNTDUE);
                }
            });

            let checkedFilter = this.citationInfoList.filter(x => x.checked == true);
            if (checkedFilter.length == this.citationInfoList.length) {
                this.IsChecked = true;
            }

            let summeryData = {
                'totalofCitations': this.totalPaymentDue
            }
            this.commService.sendSummeryData(summeryData);
            if (index == 0) {
                this.commService.sendCartCitationData(citations);
            }
        } else {
            this.commService.sendCartCitationData(citations);
        }
    }

    search(term: string) {
        if (!term) {
            this.citationInfoList = this.citationMainInfoList;
        } else {
            this.citationInfoList = this.citationMainInfoList.filter(x =>
                this.datePipe.transform(x.ISSUEDATE.trim().toLowerCase(), 'yyyy-MM-dd').includes(term.trim().toLowerCase())
            );
        }
    }

    clearFilter() {
        const ele = document.getElementById("searchbyIssueDate") as HTMLInputElement;
        ele.value = null;
        let checkboxes = document.getElementsByName('Citation');
        Array.from(checkboxes).forEach((item) => {
            let selectedCheckBoz = item["value"];
            if (selectedCheckBoz == 'Paid' && item["checked"] == true) {
                this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) == 0);
            } else if (selectedCheckBoz == 'All' && item["checked"] == true) {
                this.citationInfoList = this.citationMainInfoList;
            }
            else if (selectedCheckBoz == 'Unpaid' && item["checked"] != true) {
                this.citationInfoList = this.citationMainInfoList;
            }
            else {
                this.IsCheckedUnpaid = true;
                this.citationInfoList = this.citationMainInfoList.filter(x => Number(x.AMOUNTDUE) > 0);
            }
        });
    }

    printCitation() {
        this.ErrorMsg = '';
        let Issuenos = '';
        let citationidList = [];
        for (let index = 0; index < this.citationInfoList.length; index++) {
            const element = this.citationInfoList[index];
            citationidList.push(element.ISSUENO)
            Issuenos = citationidList.join();
        }
        if (Issuenos.length > 0) {
            window.open('' + Global.ZebraPrintReportPath + '?reportName=ParkingCitationReport&showpdf=false&rendertopdf=false&IssueNos=' + Issuenos, '_blank');
        } else {
            this.ErrorMsg = 'No data to print';
        }

    }

    getCitationTowEligibleCounts(citationInfoList = []) {
        let IssueNos = '';
        let citationidList = [];
        for (let index = 0; index < citationInfoList.length; index++) {
            const element = citationInfoList[index];
            citationidList.push(element.ISSUENO)
            IssueNos = citationidList.join();
        }
        this.CitationTowEligibleCounts = [];
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetCitationTowEligibleCounts?IssueNos=' + IssueNos)
            .subscribe(result => {
                if (result) {
                    this.CitationTowEligibleCounts = result;
                }
                else {
                    this.CitationTowEligibleCounts = [];
                }
                if (result && this.CitationTowEligibleCounts.length > 0) {
                    this.citationTowEligible = this.CitationTowEligibleCounts[0];
                } else {
                    this.citationTowEligible = {
                        'AllCitations': 0,
                        'TowEligible': 0,
                        'TowEligibleTotal': 0,
                        'AllCitationsTotal': 0,
                    }
                }
            },
                error => {
                    this.ErrorMsg = <any>error;
                    this.gridLoader = false;
                });
    }

    getPaidCitationList() {
        this.CitationTowEligibleCounts = [];
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetPaidCitationList?TowId=' + localStorage.getItem('TowId'))
            .subscribe(result => {
                if (result) {
                    this.PaidCitationList = result;
                    let CIDataList = [];
                    Array.from(result.CitationIds.split(',')).forEach((value, i) => {
                        let checkedFilter: any = this.citationInfoList.filter(x => x.ISSUENO == value)
                        const index = this.citationInfoList.findIndex(x => x.ISSUENO == value);
                        this.citationInfoList[index].checked = true;
                        this.totalPaymentDue += Number(checkedFilter[0].AMOUNTDUE);
                        CIDataList.push(checkedFilter[0]);

                    });
                    let citations = {
                        'totalofCitations': this.totalPaymentDue,
                        'CIData': CIDataList
                    }

                    this.commService.sendCitationsDataToDisposition(citations);
                }
            },
                error => {
                    this.ErrorMsg = <any>error;
                    this.gridLoader = false;
                });
    }
}
