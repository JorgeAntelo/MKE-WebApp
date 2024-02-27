import { Component, OnInit, NgZone, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '../../shared/components/navigation/navigation.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LocalStorageService } from 'angular-2-local-storage';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Global } from 'src/app/shared/global';
import { UtilService } from 'src/app/core/services/util.service';
import { MatRadioChange } from '@angular/material';


@Component({
    selector: 'onlinepaymentlist',
    templateUrl: './onlinepaymentlist.component.html',
    styleUrls: ['./onlinepaymentlist.component.css'],
    providers: [DatePipe, CurrencyPipe]
})
export class OnlinepaymentlistComponent implements OnInit {
    paidList: any;
    ErrorMessage:any = '';
    ErrorMsg: any = "";
    EnterpriseId: any;
    UserName: any;
    TowId: any;
    OnlinePaymentList: any;
    SearchForm: FormGroup;
    Pagenumber: any;
    PageId: any;
    PageSize = Global.PageSize;
    TotalPagenum: any;
    IsInterval: any;
    ReviewHeader:any;
    TotalPageCount: any[];
    TotalRecord: string;
    CurrentDate = new Date();
    webUrl = Global.PoliceURL;
    @ViewChild('templateReview') templateReview: TemplateRef<any>;
    RefObject: {};
    UserId: any;
    constructor(
        private _dataService: DataService,
        public nav: NavigationService,
        private localStorageService: LocalStorageService,
        private modalService: BsModalService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private ngZone: NgZone,
        private fb: FormBuilder,
        private http: HttpClient,
        private datePipe: DatePipe,
        private currencyPipe: CurrencyPipe,
        public sanitizer: DomSanitizer,
        public utilService: UtilService
    ) {
        this.setHeight();
    }
    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            // this.PageId = params.PageId;
            // this.RoleId = params.RoleId;
            this.TowId = params.TID;
            this.UserId = params.uid;
            // if (params.Id) {
            //   Guid = params.Id;
            // }
            // else {
            //   Guid = this.localStorageService.get('GUID');
            // }
            this.Pagenumber = 1;
            if (this.localStorageService.get('EnterpriseId') != null) {
                this.EnterpriseId = this.localStorageService.get('EnterpriseId');
            }
            if (this.localStorageService.get('TowCompanyId') != null) {
                this.UserName = this.localStorageService.get('UserName');
            }

            this.ErrorMsg = '';
            if (this.localStorageService.get('EnterpriseId') != null) {
                this.EnterpriseId = this.localStorageService.get('EnterpriseId');
            }

            this.createForm();
            this.Load(this.SearchForm);
        });
 

    }

 setHeight() {
    this.IsInterval = setInterval(() => {
        // first parameter is the message to be passed
        // second paramter is the domain of the parent              
        // in production always pass the target domain for which the message is intended             

        window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);

    // Receive message
    window.addEventListener('message', function (event) {
        this.localStorage.setItem('scroll_top', event.data);
    });
  }
    createForm() {
        this.SearchForm = new FormGroup({
            RecordIdFormControl: new FormControl(''),
            PlateFormControl: new FormControl(''),
            VinFormControl: new FormControl(''),
            ConfirmationCodeFormControl: new FormControl(''),
            PaymentDateFormControl: new FormControl(''),
            CustomerNameFormControl: new FormControl(''),
            PhoneFormControl: new FormControl(''),
            AuthorizationCodeFormControl: new FormControl(''),
            StatusFormControl: new FormControl(''),
            FilterFormControl: new FormControl(''),
            // PaidFormControl: new FormControl(''),
            // UnPaidFormControl: new FormControl(''),
            // InsuranceFormControl: new FormControl(''),
        });
    }
    filterChange(event: MatRadioChange) {
  
        if(event.source.value ==1 || event.source.value ==2 || event.source.value ==3)
        {
            this.SearchForm.controls['StatusFormControl'].setValue('2');
            this.SearchForm.controls['StatusFormControl'].enable() ;
        }
    }

    // ChangeAvailability(event) {
    //     this.isCheckedAvailability = event.checked;//!
    // }
    Edit() {

    }
    Search(obj) {
        if (this.SearchForm.valid) {
            this.Load(obj);
        }
    }
    Load(obj) {
        this.ErrorMessage = '';
        this.OnlinePaymentList = [];
        let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
        let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
        let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
        let PaymentDate = this.SearchForm.controls["PaymentDateFormControl"].value ? (this.SearchForm.controls["PaymentDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["PaymentDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["PaymentDateFormControl"].value.getFullYear() : '';
        let CustomerName = this.SearchForm.controls["CustomerNameFormControl"].value ? this.SearchForm.controls["CustomerNameFormControl"].value : '';
        let Phone = this.SearchForm.controls["PhoneFormControl"].value ? this.SearchForm.controls["PhoneFormControl"].value : '';
        let AuthCode = this.SearchForm.controls["AuthorizationCodeFormControl"].value ? this.SearchForm.controls["AuthorizationCodeFormControl"].value : '';
        let Status = this.SearchForm.controls["StatusFormControl"].value ? this.SearchForm.controls["StatusFormControl"].value : '';
        let StatusType = this.SearchForm.controls["FilterFormControl"].value ? this.SearchForm.controls["FilterFormControl"].value : '';
        this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/GetAppPaymentList?PageNum=' + this.Pagenumber +
            '&PageSize=' + this.PageSize +
            '&RecordId=' + RecordId +
            '&Plate=' + Plate +
            '&Vin=' + Vin +
            '&PaymentDate=' + PaymentDate +
            '&CustomerName=' + CustomerName +
            '&Phone=' + Phone +
            '&AuthCode=' + AuthCode +
            '&Status=' + Status +
            '&StatusType=' + StatusType)
            .subscribe(result => {
                if (result != null && result.length > 0) {
                    this.OnlinePaymentList = result;
                    this.TotalPagenum = result[0]["TotalPages"];
                    this.TotalPageCount = [];
                    for (var i = 1; i <= this.TotalPagenum; i++) {
                        this.TotalPageCount.push({ Id: i, Description: i });
                    }
                    if (this.Pagenumber == 1) {
                        this.PageId = 1;
                    }
                    this.TotalRecord = "Total Records Found: " + result[0]["TotalRecords"];
                }
                else {
                    this.ErrorMsg = Global.RecordNotFoundMessage;
                }

            },
                error => { this.ErrorMsg = <any>error });
    }
    Clear() {
        this.SearchForm.reset();
        this.SearchForm.controls['StatusFormControl'].disable() ;
        this.Load(this.SearchForm);
    }
    onPageChange(PageNumber: any) {
        this.Pagenumber = PageNumber;
        this.PageId = PageNumber;
        this.Load(this.SearchForm.value);
    }

    first() {
        if (this.PageId === 'undefined' || this.PageId > 1) {
            this.Pagenumber = 1;
            this.PageId = this.Pagenumber;
            this.Load(this.SearchForm.value);
        }
    }

    previous() {
        if (this.PageId != 'undefined') {
            if (this.PageId > 1) {
                this.Pagenumber = this.PageId - 1;
                this.PageId = this.Pagenumber;
                this.Load(this.SearchForm.value);
            }
        }
    }

    next() {
        if (this.PageId != 'undefined') {
            if (this.PageId < this.TotalPagenum) {
                this.Pagenumber = this.PageId + 1;
                this.PageId = this.Pagenumber;
                this.Load(this.SearchForm.value);
            }
        }
    }

    last() {
        if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
            this.Pagenumber = this.TotalPagenum;
            this.PageId = this.Pagenumber;
            this.Load(this.SearchForm.value);
        }

    }
    DownLoadReceipt(PaidId, TowingId) {
        this._dataService.postAndDownload(Global.DLMS_API_URL + 'api/Disposition/DownloadOnlinePaymentReceipt', {
            TowId: TowingId,
            PaidId: PaidId
        }).subscribe((data) => {
            const newBlob = new Blob([data], { type: "application/pdf" });
            var objectUrl = URL.createObjectURL(newBlob);
            window.open(objectUrl, "_blank");
        }, error => {
            // this.toastService.error(error.message, "Error");
        });
    }

    Review(obj) {
        console.log(obj);
        this.RefObject = {
            UserId: this.UserId,
            TowingId: obj['Towing_Id'],
            RecordId: obj['Impound_Num'],
            RequestType:obj['RequestType'],
        }     
        this.ReviewHeader=obj['RequestType'];
        this.utilService.modalRef2 = this.modalService.show(this.templateReview, Object.assign({}, this.utilService.config, { class: 'gray modal-lg modal-dialog-center' }));
        document.getElementById("modal-review").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
    }

    ReviewClosed(stasus){
        this.Load(this.SearchForm.value);
    }
    
    CloseReview(){
        this.utilService.modalRef2.hide();
        this.Load(this.SearchForm.value);
    }

    NavigatetoNewTab(TowingId:number, TTIApproval:any, IsReleaseToInsurance:any){

        debugger
        if(IsReleaseToInsurance && !TTIApproval){
            this.ErrorMessage = "Please approve the release to insurance."
            return;
        }
        window.open(`${this.webUrl}/Officer/TowEditNew.aspx?TID=${TowingId}&FromList=OnlinPaymentList.aspx&TowStatus=Received&IsOnlinePaid=1`);

    }
}