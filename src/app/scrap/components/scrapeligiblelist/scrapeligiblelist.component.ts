import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ThrowStmt } from '@angular/compiler';
//import { ScrapService } from '../../Scrap.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { DatePipe } from '@angular/common';
import { Sort } from '@angular/material/sort';

@Component({
    selector: 'app-scrapeligiblelist',
    templateUrl: './scrapeligiblelist.component.html',
    styleUrls: ['./scrapeligiblelist.component.css'],
    styles: [`
    
        ::ng-deep .tooltipc .mat-calendar-body-cell-content {
            /*border-color: rgba(0,0,0,.38);*/
            /* border-style: dashed; */
            background: rgba(22,249,8,1)!important;
            background-color: rgba(22,249,8,1)!important ;
            color:#fff!important;
            font-weight: 400;
            /*box-shadow:inset 0 0 0 1px #fff;*/
         }
         ::ng-deep .mat-calendar-body-disabled.ng-star-inserted.tooltipc .mat-calendar-body-cell-content{   
          background: rgba(22,249,8,0.5) !important;
          background-color: rgba(22,249,8,0.5) !important;
          color:#fff!important;
          font-weight: 400;
      
       }        
         ::ng-deep .tooltipc .mat-calendar-body-today:not(.mat-calendar-body-selected) {
            border-color: rgba(0,0,0,0.38);
            box-shadow:inset 0 0 0 1px #fff;
        }
    
    
      `]
})
export class ScrapeligiblelistComponent implements OnInit {

    @ViewChild('templateAddVehicle') templateAddVehicleRef: TemplateRef<any>;
    public modalAddVehicleRef: BsModalRef;
    @ViewChild('templateConfirm')
    public TemplateConfirmRef: TemplateRef<any>;
    public modalConfirmRef: BsModalRef;
    @ViewChild('templateMoveAuctionDate')
    public TemplateMoveAuctionDateRef: TemplateRef<any>;
    public modalMoveAuctionDateRef: BsModalRef;
    @ViewChild('templateAddVehicleConfirm')
    public templateAddVehicleConfirmRef: TemplateRef<any>;
    public modalAddVehicleConfirmRef: BsModalRef;

    @ViewChild('templateAuditScrap') templateAuditScrapRef: TemplateRef<any>;
    public modalAuditScrapRef: BsModalRef;

    @ViewChild('templateVerify')
    public templateVerifyRef: TemplateRef<any>;
    public modalVerifyRef: BsModalRef;

    public config = {
        animated: true,
        keyboard: false,
        backdrop: true,
        ignoreBackdropClick: true
    };
    indLoading = false;
    LoaderImage: any;
    ErrorMsg: any;
    SuccessMsg: any;
    UserId: number;
    // scrapService: ScrapService;
    /*  TowRowsList: any;
     TowColumnsList: any; */
    ScrapEligibleList: any[];
    ScrapEligibleListArray: FormArray;
    SearchForm: FormGroup;
    Pagenumber: any;
    PageId: any;
    PageSize = Global.PageSize;
    TotalPagenum: any;
    TotalPageCount: any[];
    TotalRecord: string;
    CurrentDate = new Date();
    MakeList: any;
    TowConfig: any;
    IsInterval: any;
    ModalLoading = false;
    ModalErrorMsg: any;
    ModalSuccessMsg: any;
    AddVehicleModalForm: FormGroup;

    SelectedTowingId: any;
    RecordIdList: any[];
    query: any;
    RoleId: number;
    ModalName: any;
    ConfirmMessage: any;
    DeleteIndex: number;
    ModalType: any;

    MoveAuctionForm: FormGroup;
    VerifyNotesForm: FormGroup;
    myMoveFilter: any;
    AuctionDates: any[];
    AuctionDatesId: number;
    AddErrorMsg: any;
    minDate = new Date();

    AuditScrapModalForm: FormGroup;
    AuditScrapList: any[];
    AuditTotalPageCount: any[];
    AuditTotalPagenum: any;
    AuditTotalRecord: any;
    AuditPagenumber: any;
    AuditPageId: any;
    verifyRefTowingId: number;
    DaysList:any[];
    constructor(private _dataService: DataService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        //private scrapServiceProvider: ScrapService,
        private formBuilder: FormBuilder,
        private excelService: ExcelService,
        private modalService: BsModalService,
        private renderer: Renderer2,
        private datePipe: DatePipe,
    ) {
        this.activatedRoute.queryParams.subscribe(params => {
            this.PageId = params.PageId;
            this.RoleId = params.RoleId;
            this.UserId = params.uid;

        });
        this.setHeight();
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
    ngOnInit() {
        this.LoaderImage = Global.FullImagePath;
        this.createForm();
        
        this.Pagenumber = 1;
        this.AuditPagenumber = 1;
        this.LoadMake();
        this.LoadDaysonLot();
       
        this.LoadAuctionDates();
       
    }

    createForm() {
        this.SearchForm = new FormGroup({
            RecordIdFormControl: new FormControl(''),
            PlateFormControl: new FormControl(''),
            VinFormControl: new FormControl(''),
            MakeFormControl: new FormControl(''),
            FromDateFormControl: new FormControl(''),
            ToDateFormControl: new FormControl(''),
            ReceivedDateFormControl: new FormControl(''),
            ImpoundDateBeforeFormControl: new FormControl(''),
            VehicleListArray: this.formBuilder.array([])
        });

        this.AddVehicleModalForm = new FormGroup({
            ProjectedRevenueFormControl: new FormControl('', [Validators.pattern(Global.DECIMAL_REGEX)]),
            SearchRecordId: new FormControl('', [Validators.required])

        });
        this.MoveAuctionForm = new FormGroup({
            MoveAuctionDateFormControl: new FormControl('', [Validators.required])
        });

        this.AuditScrapModalForm = new FormGroup({
            AuditRecordIdFormControl: new FormControl(''),
            AuditfromdateFormControl: new FormControl(''),
            AudittodateFormControl: new FormControl('')
        });

        this.VerifyNotesForm = new FormGroup({
            VerifyNotesFormControl: new FormControl('', [Validators.required])
        });

    }
    filterMoveDates() {
        this.myMoveFilter = (d: Date): boolean => {
            let status = false;
            this.AuctionDates.forEach(m => {
                if (new Date(m.AuctionDate).toDateString() === d.toDateString()) {
                    status = true;
                }

            });
            return status;
        }
    }
    /*  get f() { return this.SearchForm.controls; } */
    initVehicleItem() {
        return this.formBuilder.group({

            TowingId: new FormControl(''),
            VerifyNotes: new FormControl('')
        });
    }

    get formData() {
        return <FormArray>this.SearchForm.get('VehicleListArray');
    }
    LoadMake(): void {
        this.ErrorMsg = "";
        this._dataService.get(Global.DLMS_API_URL + 'api/Make')
            .subscribe(Makes => {
                this.MakeList = Makes;
            },
            error => {
                this.ErrorMsg = <any>error
            });

    }
    Search(obj) {
        if (this.SearchForm.valid) {
            this.LoadTowList(obj);
        }
    }
    LoadTowList(obj): void {
        this.ScrapEligibleList = [];
        this.ErrorMsg = "";
        this.SuccessMsg = "";
        this.TotalPageCount = [];
        this.TotalPagenum = '';
        let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
        let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
        let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
        let Make = this.SearchForm.controls["MakeFormControl"].value;
        let FromDate = this.SearchForm.controls["FromDateFormControl"].value ? (this.SearchForm.controls["FromDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["FromDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["FromDateFormControl"].value.getFullYear() : '';
        let ToDate = this.SearchForm.controls["ToDateFormControl"].value ? (this.SearchForm.controls["ToDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ToDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ToDateFormControl"].value.getFullYear() : '';
        let ReceivedDate = this.SearchForm.controls["ReceivedDateFormControl"].value ? (this.SearchForm.controls["ReceivedDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ReceivedDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ReceivedDateFormControl"].value.getFullYear() : '';
        
        let daysonLot = (<FormControl>this.SearchForm.controls["ImpoundDateBeforeFormControl"]).value ? (<FormControl>this.SearchForm.controls["ImpoundDateBeforeFormControl"]).value : this.DaysList[0].DayId;
        this.indLoading = true;
        this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapEligibleList?PageNum=' + this.Pagenumber +
            "&PageSize=" + this.PageSize +
            '&RecordId=' + RecordId +
            '&Plate=' + Plate +
            '&Vin=' + Vin +
            '&Make=' + Make +
            '&FromDate=' + FromDate +
            '&ToDate=' + ToDate +
            '&ReceivedDate=' + ReceivedDate +
            '&DaysonLot=' + daysonLot +
            '&DeviceType=W')
            .subscribe(items => {
                this.indLoading = false;
                if (items != null) {
                    this.ScrapEligibleList = items;
                    const control = <FormArray>this.SearchForm.controls['VehicleListArray'];
                    control.controls = [];
                    for (var i = 0; i < this.ScrapEligibleList.length; i++) {
                        //this.IsDateClosed = this.AuctionDetailsList[i]["IsClosed"];
                        // add new formgroup
                        control.push(this.initVehicleItem());

                        this.SearchForm.controls.VehicleListArray['controls'][i].controls['TowingId']
                            .setValue(this.ScrapEligibleList[i]["TowingId"], { onlySelf: true });


                    }
                    this.TotalPagenum = this.ScrapEligibleList[0]["TotalPages"];
                    this.TotalPageCount = [];
                    for (var i = 1; i <= this.TotalPagenum; i++) {
                        this.TotalPageCount.push({ Id: i, Description: i });
                    }
                    if (this.Pagenumber == 1) {
                        this.PageId = 1;
                    }
                    this.TotalRecord = "Total Records Found: " + this.ScrapEligibleList[0]["TotalRecords"];
                }
                else {
                    this.ScrapEligibleList = [];

                }
            },
            error => {
                this.indLoading = false;
                this.ErrorMsg = <any>error
            });
    }
    Clear() {
        this.SearchForm.reset();
        (<FormControl>this.SearchForm.controls['ImpoundDateBeforeFormControl']).setValue(this.DaysList[0].DayId);
        this.LoadTowList(this.SearchForm);
    }
    onPageChange(PageNumber: any) {
        this.Pagenumber = PageNumber;
        this.PageId = PageNumber;
        this.LoadTowList(this.SearchForm.value);
    }

    first() {
        if (this.PageId === 'undefined' || this.PageId > 1) {
            this.Pagenumber = 1;
            this.PageId = this.Pagenumber;
            this.LoadTowList(this.SearchForm.value);
        }
    }

    previous() {
        if (this.PageId != 'undefined') {
            if (this.PageId > 1) {
                this.Pagenumber = this.PageId - 1;
                this.PageId = this.Pagenumber;
                this.LoadTowList(this.SearchForm.value);
            }
        }
    }

    next() {
        if (this.PageId != 'undefined') {
            if (this.PageId < this.TotalPagenum) {
                this.Pagenumber = this.PageId + 1;
                this.PageId = this.Pagenumber;
                this.LoadTowList(this.SearchForm.value);
            }
        }
    }

    last() {
        if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
            this.Pagenumber = this.TotalPagenum;
            this.PageId = this.Pagenumber;
            this.LoadTowList(this.SearchForm.value);
        }

    }

    download() {
        let Itemexport = [];

        for (let i = 0; i < this.ScrapEligibleList.length; i++) {
            Itemexport.push({
                'RecordId': this.ScrapEligibleList[i]['RecordId'],
                'Issue #': this.ScrapEligibleList[i]['IssueNo'],
                'Space': this.ScrapEligibleList[i]['RowSpace'],
                'Plate': this.ScrapEligibleList[i]['Plate'],
                'VIN': this.ScrapEligibleList[i]['VIN'],
                'Year': this.ScrapEligibleList[i]['VehYear'],
                'Make': this.ScrapEligibleList[i]['Make'],
                'Model': this.ScrapEligibleList[i]['Model'],
                'Color': this.ScrapEligibleList[i]['Color'],
                'Vehicle Received': this.datePipe.transform(this.ScrapEligibleList[i]['VehicleReceivedDate'], 'MM/dd/yyyy h:mm a') + "\t",
                'Potential Disposal': this.datePipe.transform(this.ScrapEligibleList[i]['PotentialDispositionDate'], 'MM/dd/yyyy h:mm a') + "\t",
                'Potential Disposal By': this.ScrapEligibleList[i]['PotentialDispositionBy'],
                'Days #': this.ScrapEligibleList[i]['TotalDaysOnLot']
            });
        }
        this.excelService.exportAsExcelFile(Itemexport, 'Scrap Authorize List');
        this.indLoading = false;
    }

    private ScrapVerify(template: TemplateRef<any>, TowingId: number) {
        this.SuccessMsg = this.ErrorMsg = "";
        this.ClearMsg();
        this.VerifyNotesForm.reset();
        this.modalVerifyRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
        this.verifyRefTowingId = TowingId;
        document.getElementById("modalVerifyRef").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
    }
    SaveVerifyNotes() {
        if (!this.VerifyNotesForm.valid) {
            this.validateAllFormFields(this.VerifyNotesForm);
            return;
        }

        let Notes = this.VerifyNotesForm.controls['VerifyNotesFormControl'].value;
        let ObjA: ScrapAuthorizeModel = new ScrapAuthorizeModel();
        ObjA.TowingId = this.verifyRefTowingId;

        ObjA.ScrapAuthorizationNotes = Notes;
        ObjA.UserId = this.UserId;

        this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/AuthorizeScrap', ObjA)
            .subscribe(result => {
                if (result.Id > 0) {
                    this.LoadTowList(this.VerifyNotesForm.value);
                    this.SuccessMsg = Global.SaveMessage;
                    this.modalVerifyRef.hide();
                } else {
                    this.ErrorMsg = result.Result;
                }
            }, error => {
                this.ErrorMsg = <any>error;
            });
    }
    OpenAddVehicle(template: TemplateRef<any>) {
        this.RecordIdList = [];
        this.SelectedTowingId = null;
        this.ClearMsg();
        this.AddVehicleModalForm.reset();

        this.modalAddVehicleRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
        document.getElementById("modalAddVehicle").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
    }
    CloseAddVehicleTemplate() {
        this.SelectedTowingId = null;
        this.ClearMsg();
        this.modalAddVehicleRef.hide();
    }
    ClearMsg() {
        this.SuccessMsg = this.ErrorMsg = this.ModalErrorMsg = this.ModalSuccessMsg = "";
    }
    onrecordIdSelected(evt) {
        this.SelectedTowingId = null;
        if (evt) {
            this.SelectedTowingId = evt.originalObject.TowingId;
        }
    }
    LoadRecordId(objFilter) {
        this.query = '';
        this.RecordIdList = [];
        this.SelectedTowingId = null;

        this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/SearchRecordIdForScrap?Search=' + objFilter.SearchRecordId).subscribe(res => {
            if (res && res.length > 0) {
                this.RecordIdList = res;
                this.RecordIdList = res.filter(function (el) {
                    return el.TCN.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
                }.bind(this));
            }
        },
            (error) => {
                console.log(error);
            });
    }
    select(item) {
        this.ClearMsg();
        this.SelectedTowingId = item.TOWING_ID;
        this.query = item.TCN;
        (<FormControl>this.AddVehicleModalForm.controls['SearchRecordId'])
            .setValue(item.TCN);
        this.RecordIdList = [];
    }
    isnull(obj, replacevalue: any): any {
        return obj ? obj : replacevalue
    }
    private AddVehicleToScrap(obj, option: boolean) {
        this.ClearMsg();
        if (!this.SelectedTowingId) {
            this.ErrorMsg = 'Record Id Required';
            document.getElementById('SearchRecordId').focus();
        }
        else {
            let ObjA: AddToScrapModel = new AddToScrapModel();
            ObjA.TowingId = this.SelectedTowingId;
            ObjA.PotentialDispositionStatus = "S";
            ObjA.ProjectedRevenue = obj.ProjectedRevenueFormControl;
            ObjA.UserId = this.UserId;

            this._dataService.post(Global.DLMS_API_URL + 'api/Aban/SavePotentialDisposal', ObjA)
                .subscribe(result => {
                    if (result.Id > 0) {
                        if (option == true) {
                            this.CloseAddVehicleTemplate();
                            this.LoadTowList(this.SearchForm);
                            this.SuccessMsg = 'Vehicle added to Scrap Authorize List';
                        }
                        else {
                            this.LoadTowList(this.SearchForm);
                            this.AddVehicleModalForm.reset();
                            this.AddVehicleModalForm.updateValueAndValidity();
                            this.ModalSuccessMsg = 'Vehicle added to Scrap Authorize List';
                        }

                    } else {
                        this.ErrorMsg = result.result;
                    }

                }, error => {


                    this.ErrorMsg = <any>error;
                });
        }
    }
    OpenConfirm(template: TemplateRef<any>, index: number) {
        this.ClearMsg();
        this.ModalName = 'Confirm Remove';
        this.ConfirmMessage = Global.RemoveConfirmationMessage;
        setTimeout(() => {
            document.getElementById('okconfirmele').focus();
        }, 100);

        this.DeleteIndex = index;
        this.ModalType = 'delete';
        this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
        document.getElementById("modalConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
    }
    OkConfirm(index: number) {
        this.ClearMsg();
        switch (this.ModalType) {
            case 'delete':
                this.DeleteScrap(index);
                break;


            default:
                this.CancelConfirm();
                break;
        }
    }

    CancelConfirm() {
        this.ClearMsg();
        this.modalConfirmRef.hide();
    }
    private DeleteScrap(i) {
        this.ClearMsg();
        let ObjA: RemoveScrapModel = new RemoveScrapModel();
        ObjA.TowingId = this.SearchForm.controls.VehicleListArray['controls'][i].controls['TowingId'].value;
        ObjA.UserId = this.UserId;
        ObjA.RemoveReason = "Removed From Scrap Authorize List";
        this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/RemoveFromScrapList', ObjA)
            .subscribe(result => {
                if (result.Id > 0) {
                    this.LoadTowList(this.SearchForm);
                    this.CancelConfirm();
                    this.SuccessMsg = "Vehicle Removed from Scrap Authorize List";
                } else {
                    this.ErrorMsg = result.result;
                    this.CancelConfirm();
                }

            }, error => {
                this.ErrorMsg = <any>error;
            });

    }

    LoadAuctionDates() {
        this.AuctionDates = [];
        this.indLoading = true;
        this._dataService.get(Global.AUCTION_API_URL + 'api/Common/GetDistinctAuctionDates')
            .subscribe(result => {
                if (result != null) {
                    this.AuctionDates = result;
                }
                else {

                }
                this.indLoading = false;
            },
            error => { this.indLoading = false; this.ErrorMsg = <any>error });
    }

    //Date Picker   
    updateDayStyles() {

        let elements = document.querySelectorAll('.endDate .mat-calendar-content mat-month-view');
        if (elements.length > 0) {

            let x = Array.from(elements[0].querySelectorAll('.mat-calendar-body-cell'));
            x.forEach(y => {
                let c = new Date(y.getAttribute('aria-label')).toISOString();
                let div = y.querySelectorAll('div')[0];
                if (this.AuctionDates.find(x => new Date(x.AuctionDate).toISOString() == c)) {
                    y.classList.add('tooltipc');
                }

            });
        }
    }
    listeners = [];

    streamOpened(event) {

        setTimeout(() => {
            this.listeners.forEach(v => {
                v();
            });

            this.listeners = [];

            let buttons = Array.from(document.querySelectorAll('mat-calendar .mat-calendar-body-cell, mat-calendar button, mat-calendar .mat-icon-button'));

            buttons.forEach(btn => {
                let x = this.renderer.listen(btn, 'click', () => {
                    setTimeout(() => {
                        this.streamOpened(event);
                    });
                })

                this.listeners.push(x);
            });
            this.updateDayStyles();
        });
    }

    CancelAuctionDateModal() {
        this.modalMoveAuctionDateRef.hide();
    }

    onMoveAuctionDateChange(obj: any) {
        if (obj.MoveAuctionDateFormControl != null) {
            let lDate = new Date(obj.MoveAuctionDateFormControl);

            let lResult = this.AuctionDates.find(x => new Date(x.AuctionDate).toISOString() == lDate.toISOString());

            if (lResult) {

                this.AuctionDatesId = lResult.AuctionDatesId;
            }
        }
    }
    OpenMoveAuctionDate(template: TemplateRef<any>, index) {
        this.filterMoveDates();
        this.DeleteIndex = index;

        this.ClearMsg();
        (<FormControl>this.MoveAuctionForm.controls['MoveAuctionDateFormControl']).setValue('');
        this.modalMoveAuctionDateRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
        document.getElementById("modalMoveAuctionDt").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
    }
    OpenAddVehicleAuction(template: TemplateRef<any>) {
        if (!this.MoveAuctionForm.valid) {
            this.validateAllFormFields(this.MoveAuctionForm);
            return;
        }
        this.AddErrorMsg = this.SuccessMsg = this.ErrorMsg = '';
        let ObjA: AddAuctionModel = new AddAuctionModel();
        ObjA.RecordId = this.ScrapEligibleList[this.DeleteIndex]['RecordId'];
        ObjA.UserId = this.UserId;
        ObjA.AuctionDatesId = this.AuctionDatesId;
        this._dataService.post(Global.AUCTION_API_URL + 'api/ScheduleAuction/ValidateAddRecordToAuction', ObjA)
            .subscribe(result => {
                if (result.Id == 0 || result.Id == -1 || result.Id == -3) {
                    this.AddErrorMsg = "";
                    this.ErrorMsg = result.result;
                } else {
                    this.AddErrorMsg = result.result;
                    if (result.Id == 1) {
                        this.AddErrorMsg = "";
                    }

                    this.modalAddVehicleConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
                    document.getElementById("modalAddVehicleConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
                }

            }, error => {


                this.ErrorMsg = <any>error;
            });



    }
    CancelAddVehicleConfirm() {
        this.AddErrorMsg = this.ErrorMsg = this.SuccessMsg = '';
        this.modalAddVehicleConfirmRef.hide();
    }
    OkAddVehicleConfirm(obj) {
        this.AddVehicle(obj);
        this.modalAddVehicleConfirmRef.hide();
    }
    private AddVehicle(obj) {
        this.SuccessMsg = this.ErrorMsg = '';

        let ObjA: AddAuctionModel = new AddAuctionModel();
        ObjA.RecordId = this.ScrapEligibleList[this.DeleteIndex]['RecordId'];
        ObjA.UserId = this.UserId;
        ObjA.AuctionDatesId = this.AuctionDatesId;
        this._dataService.post(Global.AUCTION_API_URL + 'api/ScheduleAuction/AddRecordToAuction', ObjA)
            .subscribe(result => {
                if (result.Id > 0) {
                    let ObjB: RemoveScrapModel = new RemoveScrapModel();
                    ObjB.TowingId = this.SearchForm.controls.VehicleListArray['controls'][this.DeleteIndex].controls['TowingId'].value;
                    ObjB.UserId = this.UserId;
                    ObjB.RemoveReason = "Removed From Scrap and Moved to Auction";
                    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/RemoveFromScrapList', ObjB)
                        .subscribe(result1 => {
                            if (result1.Id > 0) {
                                this.LoadTowList(this.SearchForm.value);
                                this.CancelAddVehicleConfirm()
                                this.CancelAuctionDateModal();

                                this.SuccessMsg = 'Vehicle added to Auction';
                            } else {
                                this.ErrorMsg = result.result;
                                this.CancelConfirm();
                            }

                        }, error => {
                            this.ErrorMsg = <any>error;
                        });

                } else {
                    this.ErrorMsg = result.result;
                }

            }, error => {
                this.ErrorMsg = <any>error;
            });
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });

    }
    OpenAuditScrap(template: TemplateRef<any>) {
        this.AuditScrapList = [];
        this.ClearMsg();
        this.AuditScrapModalForm.reset();
        this.LoadAuditScrapList(this.AuditScrapModalForm.value);
        this.modalAuditScrapRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
    }

    CloseAuditScrapTemplate() {
        this.ClearMsg();
        this.modalAuditScrapRef.hide();
    }
    ClearAuditScrap(obj) {
        this.ClearMsg();
        this.AuditScrapModalForm.reset();
        this.AuditScrap(obj);
    }
    AuditScrap(obj: any) {
        this.AuditPagenumber = 1;
        this.LoadAuditScrapList(obj);
    }
    LoadAuditScrapList(obj): void {
        this.AuditScrapList = [];
        this.ClearMsg();
        this.AuditTotalPageCount = [];
        this.AuditTotalPagenum = '';
        let RecordId = this.AuditScrapModalForm.controls["AuditRecordIdFormControl"].value ? this.AuditScrapModalForm.controls["AuditRecordIdFormControl"].value : '';

        let FromDate = this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value ? (this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getMonth() + 1) + '-' + this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getDate() + '-' + this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getFullYear() : '';
        let ToDate = this.AuditScrapModalForm.controls["AudittodateFormControl"].value ? (this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getMonth() + 1) + '-' + this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getDate() + '-' + this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getFullYear() : '';
        this.indLoading = true;
        this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapAuditList?PageNum=' + this.AuditPagenumber +
            "&PageSize=" + this.PageSize +
            '&RecordId=' + RecordId +
            '&FromDate=' + FromDate +
            '&ToDate=' + ToDate +
            '&DeviceType=W')
            .subscribe(items => {
                this.indLoading = false;
                if (items != null && items.length > 0) {
                    this.AuditScrapList = items;
                    this.AuditTotalPagenum = this.AuditScrapList[0]["TotalPages"];
                    this.AuditTotalPageCount = [];
                    for (var i = 1; i <= this.AuditTotalPagenum; i++) {
                        this.AuditTotalPageCount.push({ Id: i, Description: i });
                    }
                    if (this.AuditPagenumber == 1) {
                        this.AuditPageId = 1;
                    }
                    this.AuditTotalRecord = "Total Records Found: " + this.AuditScrapList[0]["TotalRecords"];
                }
                else {
                    this.AuditScrapList = [];

                }
            },
            error => {
                this.indLoading = false;
                this.ModalErrorMsg = <any>error
            });
    }

    onPageChangeAudit(PageNumber: any) {
        this.AuditPagenumber = PageNumber;
        this.AuditPageId = PageNumber;
        this.LoadAuditScrapList(this.AuditScrapModalForm.value);
    }

    Auditfirst() {
        if (this.AuditPageId === 'undefined' || this.AuditPageId > 1) {
            this.AuditPagenumber = 1;
            this.AuditPageId = this.AuditPagenumber;
            this.LoadAuditScrapList(this.AuditScrapModalForm.value);
        }
    }

    Auditprevious() {
        if (this.AuditPageId != 'undefined') {
            if (this.AuditPageId > 1) {
                this.AuditPagenumber = this.AuditPageId - 1;
                this.AuditPageId = this.AuditPagenumber;
                this.LoadAuditScrapList(this.AuditScrapModalForm.value);
            }
        }
    }

    Auditnext() {
        if (this.AuditPageId != 'undefined') {
            if (this.AuditPageId < this.AuditTotalPagenum) {
                this.AuditPagenumber = this.AuditPageId + 1;
                this.AuditPageId = this.AuditPagenumber;
                this.LoadAuditScrapList(this.AuditScrapModalForm.value);
            }
        }
    }

    Auditlast() {
        if (this.AuditPageId === 'undefined' || this.AuditPageId < this.AuditTotalPagenum) {
            this.AuditPagenumber = this.AuditTotalPagenum;
            this.AuditPageId = this.AuditPagenumber;
            this.LoadAuditScrapList(this.AuditScrapModalForm.value);
        }

    }
    private VehicleInfo(index: number) {
        let TowingId: number = this.ScrapEligibleList[index]['TowingId'];
        window.open(Global.PoliceURL + 'Officer/Tabs/VehicleInfoTab.aspx?TID=' + TowingId + '&FromList=SearchTow.aspx', '_blank');
    }
    setClass(tl) {
        if (tl.IsHealthTow == true) {
            return 'tag-bgpink';
        }
        else {
            return '';
        }
    }
    LoadDaysonLot(): void {
        this.ErrorMsg = "";
        this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapDaysOnLot')
          .subscribe(Days => {           
            this.DaysList = Days;
            (<FormControl>this.SearchForm.controls["ImpoundDateBeforeFormControl"]).setValue(this.DaysList[0].DayId);
            this.LoadTowList(this.SearchForm);
        },
          error => {
            this.ErrorMsg = <any>error
          });
    
      }
    sortListData(sort: Sort) {
        const data = this.ScrapEligibleList.slice();
        if (!sort.active || sort.direction === '') {
            this.ScrapEligibleList = data;
            return;
        }

        this.ScrapEligibleList = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {

                /* case 'recordid': return compare(parseInt(a.TCN.replace(/[^\d]/g, '')), parseInt(b.TCN.replace(/[^\d]/g, '')), isAsc); */
                case 'recordid': return compare(a.RecordId, b.RecordId, isAsc);
                case 'issueno': return compare(a.IssueNo, b.IssueNo, isAsc);
                case 'space': return compare(a.RowSpace, b.RowSpace, isAsc);
                case 'plate': return compare(a.Plate, b.Plate, isAsc);
                case 'vin': return compare(a.VIN, b.VIN, isAsc);
                case 'year': return compare(a.VehYear, b.VehYear, isAsc);
                case 'make': return compare(a.Make, b.Make, isAsc);
                case 'model': return compare(a.Model, b.Model, isAsc);
                case 'color': return compare(a.Color, b.Color, isAsc);
                case 'receiveddate': return compare(a.VehicleReceivedDate, b.VehicleReceivedDate, isAsc);
                case 'pdisposaldate': return compare(a.PotentialDispositionDate, b.PotentialDispositionDate, isAsc);
                /* case 'pdisposalby': return compare(a.PotentialDispositionBy,b.PotentialDispositionBy, isAsc); */
                case 'daysonlot': return compare(a.TotalDaysOnLot, b.TotalDaysOnLot, isAsc);
                //case 'letter500': return compare((a.Letter500Count>0?'yes':'no'),b.Letter500Count>0?'yes':'no', isAsc);

                default: return 0;
            }
        });
    }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
class ScrapAuthorizeModel {
    TowingId: number;
    ScrapAuthorizationNotes: string;
    UserId: number;
}
class AddToScrapModel {
    TowingId: number;
    PotentialDispositionStatus: string;
    ProjectedRevenue: number;
    UserId: number;
}
class RemoveScrapModel {
    TowingId: number;
    UserId: number;
    RemoveReason: string;
}
class AddAuctionModel {
    RecordId?: number;
    AuctionDatesId?: number;
    UserId?: number;
}
