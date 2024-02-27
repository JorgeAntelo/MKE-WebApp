import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef,ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';

@Component({
  selector: 'app-abanlist',
  templateUrl: './abanlist.component.html',
  styleUrls: ['./abanlist.component.css']
})
export class AbanlistComponent implements OnInit {
  @ViewChild('templateOLInfo') public templateOLRef: TemplateRef<any>;
  @ViewChild('templateConfirm') public templateConfirm: TemplateRef<any>;
  @ViewChild('templateCancel') public templateCancel: TemplateRef<any>;
  @ViewChild('templateEvent') public templateEvent: TemplateRef<any>;
  @ViewChild('templateAssign') public templateAssign: TemplateRef<any>;
  @ViewChild('templateDispatch') public templateDispatch: TemplateRef<any>;
  @ViewChild('templateAudit') public templateAudit: TemplateRef<any>;

  @ViewChild('cirload') cirloadElementRef: ElementRef;

  public modalOLRef: BsModalRef;
  public modalConfirmRef: BsModalRef;
  public modalCancelRef: BsModalRef;
  public modalEventRef: BsModalRef;
  public modalAssignRef: BsModalRef;
  public modalDispatchRef: BsModalRef;
  public modalAuditRef: BsModalRef;

  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  indLoading = false;
  AbanListTimeLeft = 60;
  isListStartTimerInd=false;
  IsPaused=false;
  LoaderImage: any;
  ModalLoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  SearchForm: FormGroup;
  minDate: Date;
  CurrentDate: Date;
  Officers: any; filteredOfficers: Observable<any[]>;
  StatusList = [];
  ViolationReasonList = []; filteredViolationReasons: Observable<any[]>;
  MakeList = []; filteredMakes: Observable<any[]>;
  ModelList = []; filteredModels: Observable<any[]>;
  StyleList = []; filteredStyles: Observable<any[]>;
  ColorList = []; filteredColors: Observable<any[]>;
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
  PEOfficers = [];filteredPOfficers: Observable<any[]>;
  IsCitizenRequest: boolean = false;
  IsAdmin: boolean = false;
  IsInterval: any;
  IsRelocate: number;
  IsFiltered: boolean=false;
  ButtonPermissionList=[];
  btnSearchPermission : boolean;
btnExportPermission : boolean;
btnResetPermission : boolean;
btnCreateNewPermission : boolean;
btnPEOAssignmentPermission : boolean;
btnPEOConfirmPermission : boolean;
btnEventInfoPermission : boolean;
btnAuditInfoPermission : boolean;
btnDispositionPermission : boolean;
btnOLInfoPermission : boolean;
PermissionPageId: number;
  RoleId: number;
  DispatchInterval:any;
  RefeshList:any;
  constructor(private _dataService: DataService,
    private router: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private excelService: ExcelService,
    private chRef: ChangeDetectorRef) {
    activatedRoute.params.subscribe(val => {
      let that = this;

    });
    this.activatedRoute.queryParams.subscribe(params => {


      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
        this.IsAdmin = Boolean(params.Ia);
      }
      let iscitizen = params.Ic;
      if (iscitizen == 1) {
        this.IsCitizenRequest = true;
      }

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
    
    window.addEventListener('message', function (event) {    
      this.localStorage.setItem('scroll_top', event.data);
    }); 
   
  }
  LoadButtonPermission(PageId, RoleId): void {

    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.ButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.ButtonPermissionList.length; i++) {
            if (this.ButtonPermissionList[i]['Control_Name'] == 'btnSearch') {
              this.btnSearchPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnExport') {
              this.btnExportPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnReset') {
              this.btnResetPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnCreateNew') {
              this.btnCreateNewPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnPEOAssignment') {
              this.btnPEOAssignmentPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnPEOConfirm') {
              this.btnPEOConfirmPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnEventInfo') {
              this.btnEventInfoPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnAuditInfo') {
              this.btnAuditInfoPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnDisposition') {
              this.btnDispositionPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLInfo') {
              this.btnOLInfoPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            
            
            
          }
        }
      },
      error => { this.ErrorMsg = <any>error });
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
      // LocationTypeFormControl: new FormControl(''),
      PlateFormControl: new FormControl(''),
      VINFormControl: new FormControl(''),
      RequestedByFormControl: new FormControl(''),
      RequestedByLastFormControl: new FormControl(''),
      IsDispatchEligibleFormControl: new FormControl(''),
      MakeFormControl: new FormControl(''),
      ModelFormControl: new FormControl(''),
      LocationFormControl: new FormControl(''),
      StyleFormControl: new FormControl(''),
      ColorFormControl: new FormControl(''),
      UsersFormControl: new FormControl(''),
      TimeLapsedFormControl: new FormControl(''),      
      BlockNumFromFormControl: new FormControl(''),
      BlockNumToFormControl: new FormControl(''),
      OfficerFormControl: new FormControl(),
      OpenComplaintsFormControl: new FormControl(''), 
    });

  }

  LoadUserDetails() {
    this.PermissionPageId=46;
    //this.ErrorMsg = this.SuccessMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/User/GetUserDetails?uid=' + this.UserId)
      .subscribe(result => {

        if (result != null && result.length > 0) {
          this.RoleId = result[0]["User_Type_Id"];
          this.LoadButtonPermission(this.PermissionPageId, this.RoleId);
        }
        else {
          this.ErrorMsg = "";

        }
      },
      error => {
        this.ErrorMsg = <any>error
      });
  }

  ngOnInit() {

    this.LoaderImage = Global.FullImagePath;
    this.CurrentDate = new Date();
    this.minDate = new Date();
    this.createForm();
    this.LoadUserDetails();
    this.LoadOfficers();
    this.LoadStatus();
    this.LoadViolationReason(0);
    //this.LoadLocationType();
    this.LoadStates();
    this.LoadCancelReasons();
    this.LoadPEOfficers();
    this.LoadMake(0, 0);
    this.LoadStyles(0);
    this.LoadColors(0);
    this.Search(this.SearchForm.value);
    //this.getlist();
  }
  ResetSearchForm() {

    this.SearchForm.reset();
    //this.createForm();
    this.Search(this.SearchForm.value);
  }
  Reload(id) {
    if (id >= 0) {
      this.Search(this.SearchForm.value);
    } else if (id == -1) {
      this.closeAssignRef();
    }
    else if (id == -2) {
      this.closeConfirmRef();
    }
    else if (id == -3) {
      this.closeCancelRef();
    }
  }

  Search(obj) {
    this.LoadAbanList(1, 50, obj);
  }

  /*****Style */
  resetStyle(): void {
    setTimeout(() => {
      (this.SearchForm.controls['StyleFormControl']).setValue(null);
    }, 1);
  }

  filterStyles(val) {
    return val ? this.StyleList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.StyleList;
  }

  displayFnStyle(style): string {
    return style ? style.Description : style;
  }

  LoadStyles(StyleId): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/aban/SelectVehicleStyles')
      .subscribe(list => {
        this.StyleList = list;
        this.filteredStyles = this.SearchForm.controls['StyleFormControl'].valueChanges
          .startWith(null)
          .map(style => style && typeof style === 'object' ? style.Description : style)
          .map(name => this.filterStyles(name));
        if (StyleId > 0) {
          for (let style of this.StyleList) {
            if (StyleId == style.Style_Id) {
              (<FormControl>this.SearchForm.controls['StyleFormControl'])
                .setValue(style, {});

            }
          }
        }
      },
        error => this.ErrorMsg = <any>error);
  }

  /*****Color */
  resetColor(): void {
    setTimeout(() => {
      (this.SearchForm.controls['ColorFormControl']).setValue(null);
    }, 1);
  }

  filterColors(val) {
    return val ? this.ColorList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ColorList;
  }

  displayFnColor(Color): string {
    return Color ? Color.Description : Color;
  }

  LoadColors(ColorId): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Color')
      .subscribe(list => {
        this.ColorList = list;
        this.filteredColors = this.SearchForm.controls['ColorFormControl'].valueChanges
          .startWith(null)
          .map(Color => Color && typeof Color === 'object' ? Color.Description : Color)
          .map(name => this.filterColors(name));
        if (ColorId > 0) {
          for (let Color of this.ColorList) {
            if (ColorId == Color.Color_Id) {
              (<FormControl>this.SearchForm.controls['ColorFormControl'])
                .setValue(Color, {});

            }
          }
        }
      },
        error => this.ErrorMsg = <any>error);
  }

  /*****Make */
  resetMake(): void {
    setTimeout(() => {
      (this.SearchForm.controls['MakeFormControl']).setValue(null);
      (this.SearchForm.controls['ModelFormControl']).setValue(null);
    }, 1);
  }

  filterMakes(val) {
    return val ? this.MakeList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.MakeList;
  }

  displayFnMake(Make): string {
    return Make ? Make.Description : Make;
  }

  LoadMake(makeid, modelid) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Make')
      .subscribe(result => {
        if (result != null && result.length > 0) {
          this.MakeList = result;

          this.filteredMakes = this.SearchForm.controls['MakeFormControl'].valueChanges
            .startWith(null)
            .map(Make => Make && typeof Make === 'object' ? Make.Description : Make)
            .map(name => this.filterMakes(name));
        }
        if (makeid > 0) {
          for (let obj of this.MakeList) {
            if (makeid == obj.Make_Id) {
              (<FormControl>this.SearchForm.controls['MakeFormControl'])
                .setValue(obj, {});
              this._dataService.get(Global.DLMS_API_URL + 'api/Model/?MakeId=' + makeid)
                .subscribe(result => {
                  if (result != null && result.length > 0) {
                    this.ModelList = result;
                    this.filteredModels = this.SearchForm.controls['ModelFormControl'].valueChanges
                      .startWith(null)
                      .map(Model => Model && typeof Model === 'object' ? Model.Description : Model)
                      .map(name => this.filterModels(name));

                    if (modelid > 0) {

                      for (let obj of this.ModelList) {
                        if (modelid == obj.Model_Id) {
                          (<FormControl>this.SearchForm.controls['ModelFormControl'])
                            .setValue(obj, {});

                        }
                      }
                    } else {
                      this.LoadModel(0);
                    }
                  }
                },
                  error => {
                    this.ErrorMsg = <any>error
                  });
            }
          }
        }

      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  changeMake(ev: MatOptionSelectionChange) {

    if (ev.source.selected) {
      this.LoadModel(ev.source.value.Make_Id);
      let data = this.MakeList.filter((x) => Number(x.Make_Id) == Number(ev.source.value.Make_Id));
      /* (<FormControl>this.SearchForm.controls['OtherMakeFormControl']).setValue('', {});
     if (data[0].Description == 'OTHER') {
        this.isOtherMakeVisible = true;
        (this.SearchForm.controls['OtherMakeFormControl']).setValidators(Validators.required);
        (this.SearchForm.controls['OtherMakeFormControl']).updateValueAndValidity();
      } else {
        this.isOtherMakeVisible = false;
        (this.SearchForm.controls['OtherMakeFormControl']).setValidators(null);
        (this.SearchForm.controls['OtherMakeFormControl']).updateValueAndValidity();
      }*/
    }
  }

  /*****Model */
  resetModel(): void {
    setTimeout(() => {
      (this.SearchForm.controls['ModelFormControl']).setValue(null);
    }, 1);
  }
  filterModels(val) {
    return val ? this.ModelList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ModelList;
  }
  displayFnModel(Model): string {
    return Model ? Model.Description : Model;
  }
  LoadModel(MakeId: number) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Model/?MakeId=' + MakeId)
      .subscribe(result => {
        if (result != null && result.length > 0) {
          this.ModelList = result;
          this.filteredModels = this.SearchForm.controls['ModelFormControl'].valueChanges
            .startWith(null)
            .map(Model => Model && typeof Model === 'object' ? Model.Description : Model)
            .map(name => this.filterModels(name));
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  /* changeModel(ev: MatOptionSelectionChange) {
 
     if (ev.source.selected) {
       let data = this.ModelList.filter((x) => Number(x.Model_Id) == Number(ev.source.value.Model_Id));
       (<FormControl>this.SearchForm.controls['OtherModelFormControl']).setValue('', {});
       if (data[0].Description == 'OTHER') {
         this.isOtherModelVisible = true;
         (this.SearchForm.controls['OtherModelFormControl']).setValidators(Validators.required);
         (this.SearchForm.controls['OtherModelFormControl']).updateValueAndValidity();
       } else {
         this.isOtherModelVisible = false;
         (this.SearchForm.controls['OtherModelFormControl']).setValidators(null);
         (this.SearchForm.controls['OtherModelFormControl']).updateValueAndValidity();
       }
     }
   }*/
  download(obj) {
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
    var SearchComplaintNo = "";
    var searchCreatedBy = null;
    var IsDispatchEligible = false;
    var MakeId = 0;
    var ModelId = 0;
    var StyleId = 0;
    var ColorId = 0;
    var vioLocation = "";
    var LastName = "";
    var CreatedBy = 0;
    var TimeLapsed = false;
    var AssignedTo=0;
    var BlockNumFrom=0;
    var BlockNumTo=0;
    
    var searchobj = {};
    if (obj.FromDateFormControl != null) {
      if (obj.FromDateFormControl.toString() !== "") {
        violationFrmDate_datestring = obj.FromDateFormControl.getFullYear() + "-" + ("0" + (obj.FromDateFormControl.getMonth() + 1)).slice(-2) + "-" + ("0" + obj.FromDateFormControl.getDate()).slice(-2);
        if (obj.ToDateFormControl.toString() !== "" && obj.ToDateFormControl != null) {
          violationToDate_datestring = obj.ToDateFormControl.getFullYear() + "-" + ("0" + (obj.ToDateFormControl.getMonth() + 1)).slice(-2) + "-" + ("0" + obj.ToDateFormControl.getDate()).slice(-2);
          //console.log(violationToDate_datestring);
          searchCounter++
        } else {
          this.ErrorMsg = "Search To Date is  missing";
          return;
        }
      }
    }

    if (obj.ViolationReasonFormControl !== undefined && obj.ViolationReasonFormControl != null) {
      violationSearchReason_ID = obj.ViolationReasonFormControl.ABAN_REASON_ID;
      searchCounter++
    }

    /* if (obj.LocationTypeFormControl !== undefined) {
       voilationSearchLOCType_ID = obj.LocationTypeFormControl.LOCATION_TYPE_ID;
       searchCounter++
     }*/
    if (obj.CreatedByFormControl != null) {
      searchCreatedBy = obj.CreatedByFormControl;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().IsDispatchEligibleFormControl) {
      IsDispatchEligible = true;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().TimeLapsedFormControl) {
      TimeLapsed = true;
      searchCounter++
    }
  

    if (obj.OfficerFormControl != null) {
      AssignedTo = obj.OfficerFormControl.OfficerId;
      searchCounter++
    }
    if (obj.BlockNumFromFormControl != null) {
      BlockNumFrom = obj.BlockNumFromFormControl;
      searchCounter++
    }
    if (obj.BlockNumToFormControl != null) {
      BlockNumTo = obj.BlockNumToFormControl;
      searchCounter++
    }

    //if(this.search_ofId!==undefined){
    //searchCreatedBy = null;//this.search_ofId;
    //   searchCounter++;
    // }
  
    if (obj.StatusFormControl !== undefined && obj.StatusFormControl !== null) {
      violationviolationStaus_ID = obj.StatusFormControl.ABAN_STATUS_ID;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().OpenComplaintsFormControl) {
      violationviolationStaus_ID = -1;
      searchCounter++
    }
    if (obj.RecordIdFormControl !== undefined && obj.RecordIdFormControl !== "") {
      SearchRecId = obj.RecordIdFormControl;
      searchCounter++
    }
    if (obj.LocationFormControl !== undefined && obj.LocationFormControl !== "") {
      vioLocation = obj.LocationFormControl;
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
    if (obj.RequestedByLastFormControl !== undefined && obj.RequestedByLastFormControl !== "") {
      LastName = obj.RequestedByLastFormControl;
      searchCounter++
    }
    if (obj.MakeFormControl !== undefined && obj.MakeFormControl != null) {
      MakeId = obj.MakeFormControl.Make_Id;
      searchCounter++
    }
    if (obj.ModelFormControl !== undefined && obj.ModelFormControl != null) {
      ModelId = obj.ModelFormControl.Model_Id;
      searchCounter++
    }
    if (obj.StyleFormControl !== undefined && obj.StyleFormControl != null) {
      StyleId = obj.StyleFormControl.Style_Id;
      searchCounter++
    }
    if (obj.ColorFormControl !== undefined && obj.ColorFormControl != null) {
      ColorId = obj.ColorFormControl.Color_Id;
      searchCounter++
    }

    if (obj.UsersFormControl !== undefined && obj.UsersFormControl != null) {
      CreatedBy = obj.UsersFormControl.User_Id;
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
        "offset": 1,
        "counter": 10000,
        "IsDispatchEligible": IsDispatchEligible,
        "MakeId": MakeId,
        "ModelId": ModelId,
        "Location": vioLocation,
        "StyleId": StyleId,
        "ColorId": ColorId,
        "LastName": LastName,
        "IsTimeLapsed": TimeLapsed,
        "EnteredBy": CreatedBy,
        "AssignedTo":AssignedTo,
        "BlockNumFrom":BlockNumFrom,
        "BlockNumTo":BlockNumTo
      };
      
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/GetComplaintDetailList', searchobj)
      .subscribe(AbanList => {
       
        if (AbanList != null && AbanList.length > 0) {
          let Itemexport = [];
   
    for (let i = 0; i < AbanList.length; i++) {
      Itemexport.push({
        'ComplaintNo': AbanList[i]['ComplaintNo'],
        'RecordId': AbanList[i]['RecordId'],
        'Status': AbanList[i]['Status'],
        'EnteredBy': AbanList[i]['NAME'],
        'EnteredDate': AbanList[i]['EnteredDate'],
        'RequestorInfo': AbanList[i]['RequestedBy'] + ', ' + AbanList[i]['Phone'] + ', ' + AbanList[i]['Email']+ ', ' +AbanList[i]['DATE']+ ', ' + AbanList[i]['NAME'],
        'Location': AbanList[i]['LOCATION'],
        'BlockNum':AbanList[i]['BlockNum'],
        'Reason': AbanList[i]['REASON'],   
        'VehicleDesc': AbanList[i]['LicNo'] + ', ' + AbanList[i]['MAKE'] + ', ' + AbanList[i]['MODEL'],
        'AssignedTo':AbanList[i]['AssignedTo']   
      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'ComplaintList');
    this.indLoading = false;
        }
      });

    
  }
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

          this.filteredPOfficers = this.SearchForm.controls['OfficerFormControl'].valueChanges
          .startWith(null)
          .map(type => type && typeof type === 'object' ? type.Officer : type)
          .map(name => this.filterPOfficers(name));
        } else {
          this.PEOfficers = [];
        }
      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  POfficerreset(): void {
    setTimeout(() => {
      (this.SearchForm.controls['OfficerFormControl']).setValue(null);
    }, 1);
  }

  filterPOfficers(val) {
   
if(val){
  const filterValue = val.toLowerCase();
  //return val ? this.PeoUsers.filter(s => s.Officer.toLowerCase().indexOf(val.toLowerCase()) === 0)
  return val ? this.PEOfficers.filter(s => s.Officer.toLowerCase().includes(filterValue))
    : this.PEOfficers;
}else{
  return this.PEOfficers;
}
 
  }

  POfficerdisplayFn(type): string {
    return type ? type.Officer : type;
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
  /*****ViolationReason */
  resetViolationReason(): void {
    setTimeout(() => {
      (this.SearchForm.controls['ViolationReasonFormControl']).setValue(null);
    }, 1);
  }
  filterViolationReasons(val) {
    return val ? this.ViolationReasonList.filter(s => s.ABAN_REASON_DESC.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ViolationReasonList;
  }
  displayFnViolationReason(ViolationReason): string {
    return ViolationReason ? ViolationReason.ABAN_REASON_DESC : ViolationReason;
  }
  LoadViolationReason(reasonid): void {
    this.ViolationReasonList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetSrchVioReason').subscribe(
      list => {
        if (list) {

          this.ViolationReasonList = list;
          this.filteredViolationReasons = this.SearchForm.controls['ViolationReasonFormControl'].valueChanges
            .startWith(null)
            .map(ViolationReason => ViolationReason && typeof ViolationReason === 'object' ? ViolationReason.ABAN_REASON_DESC : ViolationReason)
            .map(name => this.filterViolationReasons(name));

          if (reasonid > 0) {
            for (let obj of this.ViolationReasonList) {
              if (reasonid == obj.ABAN_REASON_ID) {
                (<FormControl>this.SearchForm.controls['ViolationReasonFormControl'])
                  .setValue(obj, {});

              }
            }
          }

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
    var SearchComplaintNo = "";
    var searchCreatedBy = null;
    var IsDispatchEligible = false;
    var MakeId = 0;
    var ModelId = 0;
    var StyleId = 0;
    var ColorId = 0;
    var vioLocation = "";
    var LastName = "";
    var CreatedBy = 0;
    var TimeLapsed = false;
    var AssignedTo=0;
    var BlockNumFrom=0;
    var BlockNumTo=0;

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

    if (obj.ViolationReasonFormControl !== undefined && obj.ViolationReasonFormControl != null) {
      violationSearchReason_ID = obj.ViolationReasonFormControl.ABAN_REASON_ID;
      searchCounter++
    }

    /* if (obj.LocationTypeFormControl !== undefined) {
       voilationSearchLOCType_ID = obj.LocationTypeFormControl.LOCATION_TYPE_ID;
       searchCounter++
     }*/
    if (obj.CreatedByFormControl != null) {
      searchCreatedBy = obj.CreatedByFormControl;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().IsDispatchEligibleFormControl) {
      IsDispatchEligible = true;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().TimeLapsedFormControl) {
      TimeLapsed = true;
      searchCounter++
    }

    //if(this.search_ofId!==undefined){
    //searchCreatedBy = null;//this.search_ofId;
    //   searchCounter++;
    // }
    
    if (obj.StatusFormControl !== undefined && obj.StatusFormControl !== null) {
      violationviolationStaus_ID = obj.StatusFormControl.ABAN_STATUS_ID;
      searchCounter++
    }
    if (this.SearchForm.getRawValue().OpenComplaintsFormControl) {
      violationviolationStaus_ID = -1;
      searchCounter++
    }
    if (obj.RecordIdFormControl !== undefined && obj.RecordIdFormControl !== "") {
      SearchRecId = obj.RecordIdFormControl;
      searchCounter++
    }
    if (obj.LocationFormControl !== undefined && obj.LocationFormControl !== "") {
      vioLocation = obj.LocationFormControl;
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
    if (obj.RequestedByLastFormControl !== undefined && obj.RequestedByLastFormControl !== "") {
      LastName = obj.RequestedByLastFormControl;
      searchCounter++
    }
    if (obj.MakeFormControl !== undefined && obj.MakeFormControl != null) {
      MakeId = obj.MakeFormControl.Make_Id;
      searchCounter++
    }
    if (obj.ModelFormControl !== undefined && obj.ModelFormControl != null) {
      ModelId = obj.ModelFormControl.Model_Id;
      searchCounter++
    }
    if (obj.StyleFormControl !== undefined && obj.StyleFormControl != null) {
      StyleId = obj.StyleFormControl.Style_Id;
      searchCounter++
    }
    if (obj.ColorFormControl !== undefined && obj.ColorFormControl != null) {
      ColorId = obj.ColorFormControl.Color_Id;
      searchCounter++
    }

    if (obj.UsersFormControl !== undefined && obj.UsersFormControl != null) {
      CreatedBy = obj.UsersFormControl.User_Id;
      searchCounter++
    }
    if (obj.OfficerFormControl != null) {
      AssignedTo = obj.OfficerFormControl.OfficerId;
      searchCounter++
    }
    if (obj.BlockNumFromFormControl != null) {
      BlockNumFrom = obj.BlockNumFromFormControl;
      searchCounter++
    }
    if (obj.BlockNumToFormControl != null) {
      BlockNumTo = obj.BlockNumToFormControl;
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
        "IsDispatchEligible": IsDispatchEligible,
        "MakeId": MakeId,
        "ModelId": ModelId,
        "Location": vioLocation,
        "StyleId": StyleId,
        "ColorId": ColorId,
        "LastName": LastName,
        "IsTimeLapsed": TimeLapsed,
        "EnteredBy": CreatedBy,
        "AssignedTo": AssignedTo,
      "BlockNumFrom":BlockNumFrom,
      "BlockNumTo":BlockNumTo
      };
      this.pageNumber = pageNumber;
      this.pageSize = pageSize;
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/GetComplaintDetailList', searchobj)
        .subscribe(items => {
          this.startListTimer();
          this.AbanList = items;
          if (this.AbanList != null && this.AbanList.length > 0) {
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
        this.filteredOfficers = this.SearchForm.controls['UsersFormControl'].valueChanges
          .startWith(null)
          .map(type => type && typeof type === 'object' ? type.Name : type)
          .map(name => this.filterOfficers(name));
      },
        error => this.ErrorMsg = <any>error);
  }

  Officerreset(): void {
    setTimeout(() => {
      (this.SearchForm.controls['UsersFormControl']).setValue(null);
    }, 1);
  }

  filterOfficers(val) {
    return val ? this.Officers.filter(s => s.Name.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.Officers;
  }

  OfficerdisplayFn(type): string {
    return type ? type.Name : type;
  }
  
  //Paging methods
  onPageChange(PageNumber: any) {
    this.pageNumber = PageNumber;
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
    if (todaydate >= Forty_Hours) {

      returntype = true;
    }
    return returntype;
  }
  LoadAbanDetails(Id) {
    //let url = '/aban?UserId=' + this.UserId + '&Id=' + Id;
    //this.router.navigateByUrl(url);
    //window.top.location.href = Global.PoliceURL + "Aban/AbanDetails.aspx?AbanId=" + Id;
    window.open(Global.PoliceURL + "Aban/AbanDetails.aspx?AbanId=" + Id,"_blank")


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
            if (statusid == 3) {
              this.indLoading = false;
              window.top.location.href = Global.PoliceURL + "Request/Request.aspx?Id=" + response;

            } else {
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
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalOLRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg modal-dialog-centered' }));
    document.getElementById("modalOLInfo").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeOLRef() {
    this.modalOLRef.hide();
  }
  OpenConfirmInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
    document.getElementById("modalConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeConfirmRef() {
    this.modalConfirmRef.hide();
  }

  OpenCancelInfo(template: TemplateRef<any>, AbanId, ReasonId, recordid, StatusId, notes) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.RecordId = recordid;
    this.StatusId = StatusId;
    this.CancelReasonId = ReasonId;
    this.CancelNotes = notes;
    this.modalCancelRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
    document.getElementById("modalCancel").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeCancelRef() {
    this.modalCancelRef.hide();
  }
  OpenPEOAssignment(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.OLID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalAssignRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
    document.getElementById("modalAssign").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeAssignRef() {
    this.modalAssignRef.hide();
  }
  OpenEventInfo(template: TemplateRef<any>, AbanId, recordid,IsFiltered) {
    this.IsFiltered=false;
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.RecordId = recordid;
    if(IsFiltered>0){
      this.IsFiltered=true;
    }
 
    this.modalEventRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray wid90 ' }));   
    document.getElementById("modalEventInfo").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeEventRef() {
    this.modalEventRef.hide();
  }
  OpenDispatchCreation(template: TemplateRef<any>, AbanId, recordid, isrelocate) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.RecordId = recordid;
    this.IsRelocate = isrelocate;
    this.modalDispatchRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeDispatchRef() {
    this.modalDispatchRef.hide();
  }

  OpenAuditInfo(template: TemplateRef<any>, AbanId, recordid) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ABANID = AbanId;
    this.RecordId = recordid;

    this.modalAuditRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray wid90 modal-dialog-centered' }));
    document.getElementById("modalAuditInfo").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  closeAuditRef() {
    this.modalAuditRef.hide();
  }

  /* getlist() {
    let RefeshList = setInterval(function () {
      
        if (!this.IsPaused) {
          this.Search(this.SearchForm.value);
        }

    }, 60000);//300000
   }*/

  startListTimer  () {
    this.IsPaused = false;
    this.AbanListTimeLeft = 60;
    this.isListStartTimerInd = true;

    var animElement = this.cirloadElementRef.nativeElement ;
    animElement.style.animation = "countdownrestart 60s linear infinite forwards";
    clearInterval(this.DispatchInterval);
    this.DispatchInterval = setInterval(() => {
        if (!this.IsPaused) {
            animElement.style.animation = "countdown 60s linear infinite forwards";
            //this.chRef.detectChanges();
                if (this.AbanListTimeLeft > 0) {
                    this.AbanListTimeLeft--;
                } else {
                    this.AbanListTimeLeft = 60;
                    this.Search(this.SearchForm.value);
                }
        }

    }, 1000)


}

PauseTimer () {

  this.isListStartTimerInd = false;
  this.IsPaused = true;
  var animElement = this.cirloadElementRef.nativeElement ;
  animElement.style.animationPlayState = "paused";
}
ResumeTimer () {
  this.isListStartTimerInd = true;
  this.IsPaused = false;
  var animElement = this.cirloadElementRef.nativeElement 
  animElement.style.animationPlayState = "running";
}

}
