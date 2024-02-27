import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ExcelService } from 'src/app/core/services/excel.service';
@Component({
  selector: 'app-abanlistalt',
  templateUrl: './abanlistalt.component.html',
  styleUrls: ['./abanlistalt.component.css']
})
export class AbanlistaltComponent implements OnInit {
  @ViewChild('templateOLInfo') public templateOLRef: TemplateRef<any>;
  @ViewChild('templateConfirm') public templateConfirm: TemplateRef<any>;
  @ViewChild('templateCancel') public templateCancel: TemplateRef<any>;
  @ViewChild('templateAssign') public templateAssign: TemplateRef<any>;
  public modalOLRef: BsModalRef;
  public modalConfirmRef: BsModalRef;
  public modalCancelRef: BsModalRef;
  public modalAssignRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  indLoading = false;
  LoaderImage: any;
  ModalLoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  SearchForm: FormGroup;
  minDate: Date;
  CurrentDate: Date;
  Officers: any; filteredOfficers: Observable<any[]>;
  StatusList = [];
  ViolationReasonList = [];
  LocationTypeList = [];
  AbanList = [];
  pageIdItem: any;
  pageNumber: any;
  totalpagenum: any;
  totalRecords: any;
  pageSize: any;
  UserId: Number;
  public totalPagecount: any[];
  states = [];
  AllOwnerInfo = [];
  ABANID: number;
  OLID: string;
  RecordId: string; StatusId: number;
  cancelreasons = [];
  CancelReasonId: number;
  CancelNotes: any;
  PEOfficers = [];
  IsCitizenRequest:boolean=false;
  IsAdmin:boolean=false;
  constructor(private _dataService: DataService,
    private router: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private excelService: ExcelService, ) {
    activatedRoute.params.subscribe(val => {
      let that = this;

    });
    this.activatedRoute.queryParams.subscribe(params => {


      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
        this.IsAdmin=Boolean(params.Ia);
      }
      let iscitizen=params.Ic;
      if(iscitizen==1){
        this.IsCitizenRequest=true;
      }

    });
  }
  private createForm() {
    this.SearchForm = new FormGroup({
      RecordIdFormControl: new FormControl(),
      ComplaintNoFormControl: new FormControl(),
      CreatedByFormControl: new FormControl(),
      FromDateFormControl: new FormControl(''),
      ToDateFormControl: new FormControl(''),
      StatusFormControl: new FormControl(''),
      ViolationReasonFormControl: new FormControl(''),
      LocationTypeFormControl: new FormControl(''),
      PlateFormControl: new FormControl(''),
      VINFormControl: new FormControl(''),
      RequestedByFormControl: new FormControl(''),
      IsDispatchEligibleFormControl: new FormControl(''),
    });

  }


  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.CurrentDate = new Date();
    this.minDate = new Date();
    this.LoadOfficers();
    this.LoadStatus();
    this.LoadViolationReason();
    this.LoadLocationType();
    this.createForm();
    this.LoadStates();
    this.Search(this.SearchForm.value);
    this.LoadCancelReasons();
    this.LoadPEOfficers();
  }
  ResetSearchForm() {
    this.AbanList = [];
    this.SearchForm.reset();
    this.createForm();
    this.Search(this.SearchForm.value);
  }
  Reload(id) {
    this.Search(this.SearchForm.value);
  }
  Search(obj) {
    this.LoadAbanList(1, 10, obj);

  }
  download() {
    let Itemexport = [];
    this.indLoading = false;
    for (let i = 0; i < this.AbanList.length; i++) {
      Itemexport.push({
        'ComplaintNo': this.AbanList[i]['ComplaintNo'],
        'RecordId': this.AbanList[i]['RecordId'],
        'Status': this.AbanList[i]['Status'],
        'Plate': this.AbanList[i]['LicNo'],
        'Make': this.AbanList[i]['MAKE'],
        'Model': this.AbanList[i]['MODEL'],
        'Reason': this.AbanList[i]['REASON'],
        'Request Date': this.AbanList[i]['DATE'],
        'Location': this.AbanList[i]['LOCATION'],
        'RequestedBy': this.AbanList[i]['RequestedBy'] + ', '+this.AbanList[i]['Phone']+', '+this.AbanList[i]['Email'],
      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'ComplaintList');
    this.indLoading = false;
  }
  LoadCancelReasons(): void {
    this.cancelreasons = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetAbanCancelReasons').subscribe(
      list => {
        if (list) {

          this.cancelreasons = list;
        } else {
          this.cancelreasons = [];
        }
      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  LoadPEOfficers(): void {
    this.PEOfficers = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetPeOfficers').subscribe(
      list => {
        if (list) {
          this.PEOfficers = list;
        } else {
          this.PEOfficers = [];
        }
      },
      error => (this.ErrorMsg = <any>error)
    );
  }

  LoadStates(): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
      .subscribe(states => {
        this.states = states;

      },
        error => this.ErrorMsg = <any>error);

  }

  LoadStatus(): void {
    this.StatusList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetStatus').subscribe(
      list => {
        if (list) {

          this.StatusList = list;
        } else {
          this.StatusList = [];
        }


      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  LoadViolationReason(): void {
    this.ViolationReasonList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetSrchVioReason').subscribe(
      list => {
        if (list) {

          this.ViolationReasonList = list;
        } else {
          this.ViolationReasonList = [];
        }


      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  LoadLocationType(): void {
    this.LocationTypeList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetSrchVioLOCType').subscribe(
      list => {
        if (list) {

          this.LocationTypeList = list;
        } else {
          this.LocationTypeList = [];
        }


      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  LoadAbanList(pageNumber, pageSize, obj): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    var searchCounter = 0
    var violationFrmDate_datestring = "";
    var violationToDate_datestring = "";
    var violationSearchReason_ID = "";
    var voilationSearchLOCType_ID = "";
    var violationviolationStaus_ID = null;
    var SearchRecId = 0;
    var SearchPlateNo = "";
    var SearchVinNo = "";
    var SearchRequestBy = "";
    var SearchComplaintNo="";
    var searchCreatedBy = null;
    var IsDispatchEligible = false;
    var searchobj = {};
    if (obj.FromDateFormControl != null) {
      if (obj.FromDateFormControl.toString() !== "") {
        violationFrmDate_datestring = obj.FromDateFormControl.getFullYear() + "-" + ("0" + (obj.FromDateFormControl.getMonth() + 1)).slice(-2) + "-" + ("0" + obj.FromDateFormControl.getDate()).slice(-2);
        if (obj.ToDateFormControl.toString() !== "" && obj.ToDateFormControl != null) {
          violationToDate_datestring = obj.ToDateFormControl.getFullYear() + "-" + ("0" + (obj.ToDateFormControl.getMonth() + 1)).slice(-2) + "-" + ("0" + obj.ToDateFormControl.getDate()).slice(-2);
          console.log(violationToDate_datestring);
          searchCounter++
        } else {
          this.ErrorMsg = "Search To Date is  missing";
          return;
        }
      }
    }

    if (obj.ViolationReasonFormControl !== undefined) {
      violationSearchReason_ID = obj.ViolationReasonFormControl.ABAN_REASON_ID;
      searchCounter++
    }

    if (obj.LocationTypeFormControl !== undefined) {
      voilationSearchLOCType_ID = obj.LocationTypeFormControl.LOCATION_TYPE_ID;
      searchCounter++
    }
    if (obj.CreatedByFormControl != null) {
      searchCreatedBy = obj.CreatedByFormControl;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().IsDispatchEligibleFormControl) {
      IsDispatchEligible = true;
      searchCounter++
    }

    //if(this.search_ofId!==undefined){
    //searchCreatedBy = null;//this.search_ofId;
    //   searchCounter++;
    // }

    if (obj.StatusFormControl !== undefined) {
      violationviolationStaus_ID = obj.StatusFormControl.ABAN_STATUS_ID;
      searchCounter++
    }
    if (obj.RecordIdFormControl !== undefined && obj.RecordIdFormControl !== "") {
      SearchRecId = obj.RecordIdFormControl;
      searchCounter++
    }
    if (obj.ComplaintNoFormControl !== undefined && obj.ComplaintNoFormControl !== "") {
      SearchComplaintNo = obj.ComplaintNoFormControl;
      searchCounter++
    }
    if (obj.PlateFormControl !== undefined && obj.PlateFormControl !== "") {
      SearchPlateNo = obj.PlateFormControl;
      searchCounter++
    }
    if (obj.VINFormControl !== undefined && obj.VINFormControl !== "") {
      SearchVinNo = obj.VINFormControl;
      searchCounter++
    }
    if (obj.RequestedByFormControl !== undefined && obj.RequestedByFormControl !== "") {
      SearchRequestBy = obj.RequestedByFormControl;
      searchCounter++
    }

    if (searchCounter == 0) {
      this.ErrorMsg = "Please enter atleast one search criteria";

    } else {
      //getting search Count
      searchobj = {
        "id": SearchRecId,
        "createdby": searchCreatedBy,
        "statusid": violationviolationStaus_ID,
        "frmDate": violationFrmDate_datestring,
        "toDate": violationToDate_datestring,
        "voilationReasonid": violationSearchReason_ID,
        "textlocationid": voilationSearchLOCType_ID,
        "LicNo": SearchPlateNo,
        "carvin_id": SearchVinNo,
        "reqBy": SearchRequestBy,
        "complaintno": SearchComplaintNo,
        "offset": pageNumber,
        "counter": pageSize,
        "IsDispatchEligible": IsDispatchEligible
      };
      this.pageNumber = pageNumber;
      this.pageSize = pageSize;
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/GetComplaintDetailList', searchobj)
        .subscribe(items => {
          this.AbanList = items;
          //console.log(this.contractList);
          if (this.AbanList != null) {
            if (this.AbanList.length > 0) {
              this.indLoading = false;
              this.totalpagenum = items[0]["TotalPages"];
              this.totalPagecount = [];
              for (var i = 1; i <= this.totalpagenum; i++) {
                this.totalPagecount.push({ Id: i, Description: i });
              }
              if (pageNumber == 1) {
                this.pageIdItem = 1;
              }

              this.pageIdItem = pageNumber;
              this.totalRecords = "Total Record Found: " + items[0]["TotalRecords"];

              var slno = 1;
              this.AbanList.forEach(aban => {
                aban.OLID = "OL" + slno;
                
                //aban.DispatchEligibleClass = aban.RecordColorClass;
                /** There needs to be separation between 
                 * Before 24 Hours, white
                 * After 24 Hours (Needs PEO Confirmation), green
                 * and Awaiting Tow (Tow Eligible after 72 Hours and PEO Confirmation). red
                 * Tow Eligible can be in red color, 
                 * New can be with just white background. 
                 * After 24 hours it can be in green color. */
                
                /*if (this.isValid(aban.ABANID, aban.Status, aban.DATE)) {
                  if (aban.ConfirmedBy > 0) {
                    aban.DispatchEligibleClass = "bg-danger text-white";
                  } else {
                    aban.DispatchEligibleClass = "bg-success text-white";
                  }

                }
                else {
                  if (aban.Status == "Initiated") {
                    if (this.IsTwentyFourHoursOld(aban.DATE)) {
                      aban.DispatchEligibleClass = "bg-success text-white";
                    }
                  }else if (aban.Status == "Dispatched") {
                    aban.DispatchEligibleClass = "btn-blue1 text-white";
                  }else if (aban.Status == "Closed") {
                    aban.DispatchEligibleClass = "btn-warning text-white";
                  } else {
                    aban.DispatchEligibleClass = "bg-success text-white";
                  }
                }*/
                slno++
              });
            }
            else {
              this.indLoading = false;
              this.totalPagecount = [];
              this.totalRecords = "";
              this.indLoading = false;
              this.totalpagenum = 0;

            }
          } else {
            this.indLoading = false;
            this.totalPagecount = [];
            this.totalRecords = "";
            this.indLoading = false;
            this.totalpagenum = 0;

          }
        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });

    }
  }
  LoadOfficers(): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetUsers')
      .subscribe(officers => {
        this.Officers = officers;
        this.filteredOfficers = this.SearchForm.controls['CreatedByFormControl'].valueChanges
          .startWith(null)
          .map(type => type && typeof type === 'object' ? type.FullName : type)
          .map(name => this.filterOfficers(name));
      },
        error => this.ErrorMsg = <any>error);
  }

  Officerreset(): void {
    setTimeout(() => {
      (this.SearchForm.controls['CreatedByFormControl']).setValue(null);
    }, 1);
  }

  filterOfficers(val) {
    return val ? this.Officers.filter(s => s.FullName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.Officers;
  }

  OfficerdisplayFn(type): string {
    return type ? type.FullName : type;
  }
  //Paging methods
  onPageChange(PageNumber: any) {
    this.pageNumber = this.pageIdItem;
    this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);
  }

  firstItem() {
    if (this.pageIdItem === 'undefined' || this.pageIdItem > 1) {
      this.pageNumber = 1;
      this.pageIdItem = this.pageNumber;
      this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);
    }
  }

  previousItem() {
    if (this.pageIdItem != 'undefined') {
      if (this.pageIdItem > 1) {
        this.pageNumber = this.pageIdItem - 1;
        this.pageIdItem = this.pageNumber;
        this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);
      }
    }
  }

  nextItem() {
    if (this.pageIdItem != 'undefined') {

      if (this.pageIdItem < this.totalpagenum) {
        this.pageNumber = this.pageIdItem + 1;
        this.pageIdItem = this.pageNumber;
        this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);
      }
    }
  }

  lastItem() {
    if (this.pageIdItem === 'undefined' || this.pageIdItem < this.totalpagenum) {
      this.pageNumber = this.totalpagenum;
      this.pageIdItem = this.pageNumber;
      this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);
    }
  }
  IsTwentyFourHoursOld(DateString) {
    let Record_Date = new Date(DateString);
    var returntype: boolean = false;
    let todaydate = this.CurrentDate;
    let TwentyFourHourDate = new Date(Record_Date);
    TwentyFourHourDate.setHours(Record_Date.getHours() + Number(Global.ABANCONFIRMWAITHOURS))
    //console.log("ABANCONFIRMWAITHOURS");
    //console.log(TwentyFourHourDate);
    if (todaydate >= TwentyFourHourDate) {

      returntype = true;
    }
    return returntype;
  }

  isValid(ID, Aban_desc, DateString) {
    let Record_Date = new Date(DateString);
    let Forty_Hours = new Date(Record_Date);
    Forty_Hours.setHours(Record_Date.getHours() + Number(Global.ABANWAITHOURS))
    let todaydate = this.CurrentDate;
    var returntype: boolean = false;
    //console.log(ID)
    //console.log(Aban_desc);
    //console.log("abanwaithours");
    //console.log(Forty_Hours);
    //console.log(todaydate) Aban_desc == "Abandoned" &&
    if ( todaydate >= Forty_Hours) {

      returntype = true;
    }
    return returntype;
  }
  LoadAbanDetails(Id) {
    //let url = '/aban?UserId=' + this.UserId + '&Id=' + Id;
    //this.router.navigateByUrl(url);
     window.top.location.href = Global.PoliceURL + "Aban/AbanDetails.aspx?AbanId=" + Id;


  }
  AddNew() {
    //let url = '/aban?UserId=' + this.UserId;
    //this.router.navigateByUrl(url);
    window.top.location.href = Global.PoliceURL + "Aban/AbanDetails.aspx";

  }
  List_CreateAbandon(AbanId, Status, RecordId) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    var statusid;
    var StatusText = "";


    if (Status == "abandon") {
      statusid = 2;
      StatusText = "confirm";
    } else if (Status == "dispatch") {

      statusid = 3;
      StatusText = "request dispatch for";

    } else if (Status == "undodispatch") {
      statusid = 5;
      StatusText = "revert dispatch";
    } else if (Status == "close") {
      statusid = 4;
      StatusText = "cancel";

    }


    if (confirm("Do you want to " + StatusText + " this Record# " + RecordId + " ?")) {
      var updObj = {
        "AbanId": AbanId,
        "StatusId": statusid,
        "UserId": this.UserId
      };
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/UpdateBAN', updObj)
        .subscribe(response => {
          if (response > 0) {
            this.SuccessMsg = "Record Updated Successfully.";
            if(statusid==3)
          {
            this.indLoading = false;
            window.top.location.href = Global.PoliceURL + "Request/Request.aspx?Id="+response;

          }else{
          this.LoadAbanList(this.pageNumber, this.pageSize, this.SearchForm.value);

          }
          } else {
            this.ErrorMsg = "Record Update Failed. Please try again.";
          }
          this.indLoading = false;
          

        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
    }
  }

  OpenOLInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalOLRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }
  closeOLRef() {
    this.modalOLRef.hide();
  }
  OpenConfirmInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;


    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }
  closeConfirmRef() {
    this.modalConfirmRef.hide();
  }

  OpenCancelInfo(template: TemplateRef<any>, AbanId, ReasonId, recordid, StatusId, notes) {
    this.ABANID = AbanId;
    this.RecordId = recordid;
    this.StatusId = StatusId;
    this.CancelReasonId = ReasonId;
    this.CancelNotes = notes;
    this.modalCancelRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }
  closeCancelRef() {
    this.modalCancelRef.hide();
  }
  OpenPEOAssignment(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;


    this.modalAssignRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }
  closeAssignRef() {
    this.modalAssignRef.hide();
  }

}
