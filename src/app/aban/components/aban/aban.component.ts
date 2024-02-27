import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, NgZone, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { TimepickerModule } from 'ngx-bootstrap';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { isNullOrUndefined } from "util";

import { AgmCoreModule, MapsAPILoader } from "@agm/core";


@Component({
  selector: 'app-aban',
  templateUrl: './aban.component.html',
  styleUrls: ['./aban.component.css']
})
export class AbanComponent implements AfterViewInit {
  @ViewChild('templateConfirm') public templateConfirm: TemplateRef<any>;
  @ViewChild('templateCancel') public templateCancel: TemplateRef<any>;
  @ViewChild('templateAssign') public templateAssign: TemplateRef<any>;
  @ViewChild('templateEvent') public templateEvent: TemplateRef<any>;
  @ViewChild('templateDispatch') public templateDispatch: TemplateRef<any>;
  @ViewChild('templateAudit') public templateAudit: TemplateRef<any>;
  @ViewChild('Address') AddressElementRef: ElementRef;
  public modalConfirmRef: BsModalRef;
  public modalCancelRef: BsModalRef;
  public modalAssignRef: BsModalRef;
  public modalEventRef: BsModalRef;
  public modalDispatchRef: BsModalRef;
  public modalAuditRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  ErrorMsg: any;
  SuccessMsg: any;
  CurrentDate: Date;
  AbanForm: FormGroup;
  Officers: any; filteredOfficers: Observable<any[]>;
  states: any; filteredStates: Observable<any[]>;

  LocationTypeList = [];
  IsVinUnavailable = false;
  IsPlateUnavailable = false;
  Isinvalid: boolean;
  vinchange: any;
  isOtherMakeVisible = false;
  isOtherModelVisible = false;
  ViolationReasonList = []; filteredViolationReasons: Observable<any[]>;
  MakeList = []; filteredMakes: Observable<any[]>;
  ModelList = []; filteredModels: Observable<any[]>;
  StyleList = []; filteredStyles: Observable<any[]>;
  ColorList = []; filteredColors: Observable<any[]>;
  carvin_id: number;
  indLoading: boolean;
  LoaderImage: any;
  AbanId: number = -1; StatusId: any; RecordId: any; Status: any; DATE: any; UserId: Number;
  phonemask: any[] = Global.phonemask;
  ControlID = "OL1";
  cancelreasons = []; CancelReasonId: number;
  PEOfficers = [];
  IsCitizenRequest: boolean = false;
  IsPopup: boolean = false;
  Header: any = "Complaint Entry Screen";
  IsDispatchEligible: boolean = false;
  IsAdmin: boolean = false;
  ComplaintNo: any; HasComplaintNo: boolean = false; IsInterval: any; IsAban: boolean;
  IsRelocate: number;
  IsPriority: boolean = false; IsStolen: boolean = false;
  IsFiltered: boolean = false;
  ButtonPermissionList = [];
  btnSavePermission: boolean;
  btnPEOAssignmentPermission: boolean;
  btnPEOConfirmPermission: boolean;
  btnEventInfoPermission: boolean;
  btnAuditInfoPermission: boolean;
  btnDispositionPermission: boolean;
  btnAddNewPermission: boolean;
  btnListPermission: boolean;
  txtCreatedDatePermission: boolean;
  VINPlateMatchPermission: boolean;
  StolenCheckPermission: boolean;
  IsStolenPermission: boolean;
  ServerDate: any;
  ServerTime: any;

  PermissionPageId: number;
  RoleId: number;
  IsEditable:boolean=true;
  IsMultiVehicle: boolean = false;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private router: Router, private modalService: BsModalService, ) {
    activatedRoute.params.subscribe(val => {
      //console.log(val);
      let AbanId = val.Id;
      let that = this;

    });
    this.activatedRoute.queryParams.subscribe(params => {
      
      let AbanId = params.Id;

      let LoggeduserId = params.UserId;
      let iscitizen = params.Ic;
      let token = params.Token;
      if (iscitizen == 1) {
        this.IsCitizenRequest = true;
        this.Header = "Report Parking Violation";
      }
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
        this.IsAdmin = Boolean(params.Ia);
        // console.log(this.UserId);
      }

      
      if (AbanId > 0) {
        if (token == "-1") {
          this.IsPopup = true;
        }
        this.AbanId = AbanId;
        this.Header = "Edit Entry";
        
        this.createForm();
        this.LoadAbanDetails(AbanId);
        //this.LoadUserDetails();
      }



    });
    this.setHeight();
  }
  Reload(id) {
    if (id > 0) {
      this.LoadAbanDetails(id);
    }
    else if (id == 0) {
      this.backtolist();
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
  setHeight() {
    this.IsInterval = setInterval(() => {
      // first parameter is the message to be passed
      // second paramter is the domain of the parent
      // in production always pass the target domain for which the message is intended
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);
  }
  ngAfterViewInit() {
    this.LoaderImage = Global.FullImagePath;
    // console.log("call ngAfterViewInit");
  }
  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.CurrentDate = new Date();
    this.StatusId = 1;

    //this.LoadOfficers(0);


    if (this.AbanId == -1) {
      this.LoadViolationReason(0);
      //this.LoadLocationType(0);
      this.LoadStates(0);
      this.LoadMake(0, 0);
      this.LoadStyles(0);
      this.LoadColors(0);
      this.createForm();
      // this.LoadUserDetails();


    }
    this.LoadCancelReasons();
    this.LoadPEOfficers();
    this.googleAutoComplete();
  }
  LoadButtonPermission(PageId, RoleId): void {

    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.ButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.ButtonPermissionList.length; i++) {
            if (this.ButtonPermissionList[i]['Control_Name'] == 'btnSave') {
              this.btnSavePermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnPEOAssignment') {
              this.btnPEOAssignmentPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnPEOConfirm') {
              this.btnPEOConfirmPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnEventInfo') {
              this.btnEventInfoPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnAuditInfo') {
              this.btnAuditInfoPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnDisposition') {
              this.btnDispositionPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnAddNew') {
              this.btnAddNewPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnList') {
              this.btnListPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'txtCreatedDate') {
              this.txtCreatedDatePermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'rbVinPlateMatch') {
              this.VINPlateMatchPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'rbStolenCheck') {
              this.StolenCheckPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'chkIsStolen') {
              this.IsStolenPermission = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }


          }
        }
        this.SetValueandValidation(this.IsCitizenRequest);
      },
        error => { this.ErrorMsg = <any>error });
  }
  LoadUserDetails() {
    this.PermissionPageId = 45;
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
  private createForm() {
    this.AbanForm = new FormGroup({
      OfficerNameFormControl: new FormControl(''),
      BadgeFormControl: new FormControl(''),
      DateFormControl: new FormControl('', [Validators.required]),
      TimeFormControl: new FormControl('', [Validators.required]),
      AddressFormControl: new FormControl('', [Validators.required]),
      ViolationReasonFormControl: new FormControl('', [Validators.required]),
      LocationTypeFormControl: new FormControl(''),
      BusinessFormControl: new FormControl(''),
      RequestedByFormControl: new FormControl(''),
      RequestedByLastFormControl: new FormControl(''),
      PlateFormControl: new FormControl(''),
      LicPlateUnavailableFormControl: new FormControl(''),
      StateFormControl: new FormControl(''),
      VINFormControl: new FormControl(''),
      VinUnavailableFormControl: new FormControl(''),
      YearFormControl: new FormControl(),
      MakeFormControl: new FormControl(),
      OtherMakeFormControl: new FormControl(),
      ModelFormControl: new FormControl(),
      PhoneFormControl: new FormControl('', [Validators.maxLength(15), Validators.pattern(Global.PHONE_REGEX)]),
      EmailFormControl: new FormControl('', [Validators.pattern(Global.EMAIL_REGEX), Validators.maxLength(50)]),
      InstructionsFormControl: new FormControl(),
      OtherModelFormControl: new FormControl(),
      PriorityFormControl: new FormControl(),
      StyleFormControl: new FormControl(''),
      ColorFormControl: new FormControl(''),
      EmailOutFormControl: new FormControl('false'),
      VinPlateMatchFormControl: new FormControl('false'),
      StolenCheckFormControl: new FormControl('', [Validators.required]),
      IsStolenFormControl: new FormControl(''),
      BlockNumFormControl: new FormControl(''),
      MultiVehicleFormControl: new FormControl()
    });
    this.LoadUserDetails();
    //this.SetValueandValidation(this.IsCitizenRequest);
    //let url=window.top.location.href.toString();

  }
  integerOnly(event) {
    const e = <KeyboardEvent>event;
    if (e.key === 'Tab' || e.key === 'TAB') {
      return;
    }
    if (
      [46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      // let it happen, don't do anything
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  SetValueandValidation(iscitizen) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetServerDateTime').subscribe(
      list => {
        if (list) {

          this.ServerDate = list[0]["ServerDate"];
          this.ServerTime = list[0]["ServerTime"];

          var objdate = new Date(this.ServerDate);
          var time = this.ServerTime;//objdate.toTimeString().slice(0, 5);//objdate.getHours() + ':' + objdate.getMinutes() ;

          if (iscitizen == 1) {
            (<FormControl>this.AbanForm.controls['RequestedByFormControl']).setValidators([Validators.required]);
            (this.AbanForm.controls['RequestedByFormControl']).updateValueAndValidity();
            (<FormControl>this.AbanForm.controls['RequestedByLastFormControl']).setValidators([Validators.required]);
            (this.AbanForm.controls['RequestedByLastFormControl']).updateValueAndValidity();
            (<FormControl>this.AbanForm.controls['PhoneFormControl']).setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(Global.PHONE_REGEX)]);
            (this.AbanForm.controls['PhoneFormControl']).updateValueAndValidity();

            (<FormControl>this.AbanForm.controls['EmailFormControl']).setValidators([Validators.required, Validators.pattern(Global.EMAIL_REGEX), Validators.maxLength(50)]);
            (this.AbanForm.controls['EmailFormControl']).updateValueAndValidity();

            
          }
          (<FormControl>this.AbanForm.controls['DateFormControl']).setValue(objdate, {});
          (this.AbanForm.controls['DateFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['TimeFormControl']).setValue(time, {});
          (this.AbanForm.controls['TimeFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['EmailOutFormControl']).setValue('false', {});
          (this.AbanForm.controls['EmailOutFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['VinPlateMatchFormControl']).setValue('false', {});
          (this.AbanForm.controls['VinPlateMatchFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['StolenCheckFormControl']).setValue('', {});
          if(!this.StolenCheckPermission){
            (<FormControl>this.AbanForm.controls['StolenCheckFormControl']).setValidators(null);
            (this.AbanForm.controls['StolenCheckFormControl']).updateValueAndValidity();
          }
        }

      });
  }

  AddNew() {
    window.top.location.href = Global.PoliceURL + "Aban/AbanDetails.aspx";
    /*this.ResetForm();
    let url = '/aban?UserId=' + this.UserId;
    this.router.navigateByUrl(url);*/
  }

  ResetForm() {
    this.AbanId = -1;
    this.StatusId = 1;
    this.AbanForm.reset();
    this.LoadStates(0);
    /*var objdate = new Date();
    var time = objdate.toTimeString().slice(0, 5);//objdate.getHours() + ':' + objdate.getMinutes() ;
    (<FormControl>this.AbanForm.controls['DateFormControl']).setValue(objdate, {});
    (this.AbanForm.controls['DateFormControl']).updateValueAndValidity();
    (<FormControl>this.AbanForm.controls['TimeFormControl']).setValue(time, {});
    (this.AbanForm.controls['TimeFormControl']).updateValueAndValidity();*/
    this.SetValueandValidation(this.IsCitizenRequest);

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
  Save(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    let origAbanId = this.AbanId;
    
    this.validateAllFormFields(this.AbanForm);
    
    if (this.AbanForm.valid) {

      this.indLoading = true;
      var vinid = null;
      if (this.carvin_id) {
        vinid = this.carvin_id;

      }
      let emailout = false;
      let vinplatematch = false;
      let stolencheck = false;
      if (obj.EmailOutFormControl == "true") {
        emailout = true;
      }
      if (obj.VinPlateMatchFormControl == "true") {
        vinplatematch = true;
      }
      if (obj.StolenCheckFormControl == "true") {
        stolencheck = true;
      }
      var makeid = null;
      var modelid = null;
      var styleid = null;
      var colorid = null;
      var stateid = null;
      var officername = null;
      var badgenum = null;
      var location = null;
      var busname = null;
      var rname = null;
      var lname = null;
      var vin = null;
      var licno = null;
      var email = null;
      var instructions = null;
      var blocknum = 0;

      if (obj.OfficerNameFormControl) {
        officername = obj.OfficerNameFormControl.toUpperCase();
      }
      if (obj.BadgeFormControl) {
        badgenum = obj.BadgeFormControl;
      }
      if (obj.AddressFormControl) {
        location = obj.AddressFormControl.toUpperCase();
      }
      if (obj.BusinessFormControl) {
        busname = obj.BusinessFormControl.toUpperCase();
      }
      if (obj.RequestedByFormControl) {
        rname = obj.RequestedByFormControl.toUpperCase();
      }
      if (obj.RequestedByLastFormControl) {
        lname = obj.RequestedByLastFormControl.toUpperCase();
      }
      if (obj.VINFormControl) {
        vin = obj.VINFormControl.toUpperCase();
      }
      if (obj.PlateFormControl) {
        licno = obj.PlateFormControl.toUpperCase();
      }
      if (obj.EmailFormControl) {
        email = obj.EmailFormControl.toUpperCase();
      }
      if (obj.InstructionsFormControl) {
        instructions = obj.InstructionsFormControl.toUpperCase();
      }



      if (obj.MakeFormControl) {
        makeid = obj.MakeFormControl.Make_Id;
      }
      if (obj.ModelFormControl) {
        modelid = obj.ModelFormControl.Model_Id;
      }

      if (obj.StyleFormControl) {
        styleid = obj.StyleFormControl.Style_Id;
      }

      if (obj.ColorFormControl) {
        colorid = obj.ColorFormControl.Color_Id;
      }
      if (obj.StateFormControl) {
        stateid = obj.StateFormControl.StateId;
      }

      if (obj.BlockNumFormControl) {
        blocknum = obj.BlockNumFormControl;
      }


      //console.log(this.UserId);
      var objdate = new Date(obj.DateFormControl);
      var strDate = (objdate.getMonth() + 1) + '/' + objdate.getDate() + '/' + objdate.getFullYear();//+ ':' + objdate.getSeconds();

      var abanobj =
        {
          "AbanId": this.AbanId,
          "UserId": this.UserId,
          "OfficerName": officername,
          "BadgeNo": badgenum,
          "Time": obj.TimeFormControl,
          "Date": strDate,//obj.DateFormControl,
          "ViolationReasonId": obj.ViolationReasonFormControl.ABAN_REASON_ID,
          "Location": location,
          "ViolationTypeId": 0,//obj.LocationTypeFormControl.LOCATION_TYPE_ID,
          "BusName": busname,
          "Rname": rname,
          "Lname": lname,
          "LicNo": licno,
          "StateId": stateid,// obj.StateFormControl.StateId,
          //"carvin_id": vinid,
          "Year": obj.YearFormControl,
          "MakeId": makeid,
          "ModelId": modelid,
          "Vin": vin,
          "Style": vin,
          "StyleId": styleid,
          "ColorId": colorid,
          "Phone": obj.PhoneFormControl,
          "Email": email,
          "Instructions": instructions,
          "IsPriority": this.IsPriority,
          "SendMail": emailout,
          "VinPlateMatch": vinplatematch,
          "StolenCheck": stolencheck,
          "IsStolen": this.IsStolen,
          "BlockNum": blocknum,
          "IsMultiVehicle": this.IsMultiVehicle,
        };
      console.log(abanobj);
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/rcedUpdate', abanobj)
        .subscribe(items => {
          this.AbanId = items.Id;
          if (items.result !== "Success") {
            this.ComplaintNo = items.result;
            this.HasComplaintNo = true;
            if (this.IsCitizenRequest) {
              let url = '/complaint?compno=' + this.ComplaintNo;
              this.router.navigateByUrl(url);
            }

          } else {
            this.HasComplaintNo = false;
          }

          this.indLoading = false;
          // this.ABAN_ID = items[0].[""];
          this.LoadAbanDetails(this.AbanId);
          if (items.Id > 0) {
            if (origAbanId == -1) {
              this.SuccessMsg = "Record Initiated Successfully."
            } else {

              this.SuccessMsg = "Record Updated Successfully."
            }

          } else {
            this.ErrorMsg = "Record Update Failed. Please try again.";
          }
        },
          error => {
            this.HasComplaintNo = false;
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
    }

  }
  LoadAbanDetails(AbanId) {
    if (AbanId == 0 || AbanId == null) {
      AbanId = -1;
    }

    var searchobj = {
      "id": AbanId,
      "createdby": null,
      "statusid": null,
      "frmDate": '',
      "toDate": '',
      "voilationReasonid": null,
      "textlocationid": null,
      "LicNo": '',
      "carvin_id": '',
      "reqBy": '',
      "complaintno": '',
      "offset": 1,
      "counter": 1,
      "IsDispatchEligible": null,
      "MakeId": 0,
      "ModelId": 0,
      "Location": '',
      "StyleId": 0,
      "ColorId": 0,
      "LastName": "",
      "IsTimeLapsed": false,
      "EnteredBy": 0,
      "AssignedTo": 0,
      "BlockNumFrom": 0,
      "BlockNumTo": 0,
    };

    this.indLoading = true;
    this._dataService.post(Global.DLMS_API_URL + 'api/Aban/GetComplaintDetailList', searchobj)
      .subscribe(items => {
        // console.log(items);
        if (items.length == 1) {
          var item = items[0];
          this.CancelReasonId = item.CancelReasonId;
          this.DATE = item.DATE;
          this.AbanId = item.ABANID;
          this.StatusId = item.StatusId;
          this.Status = item.Status;
          this.RecordId = item.RecordId;
          this.IsAban = item.IsAban;
          this.IsPriority = item.IsPriority;
          this.IsStolen = item.IsStolen;
          this.IsDispatchEligible = item.IsDispatchEligible;
          this.IsMultiVehicle = item.IsMultiVehicle;
          if (item.ComplaintNo) {
            this.ComplaintNo = item.ComplaintNo;
            this.HasComplaintNo = true;
          } else {
            this.HasComplaintNo = false;
          }
          if(item.CreatedGroupId!=18){
            if(this.RoleId==18 || this.RoleId==19){
              this.IsEditable=false;
            }
          }

          (<FormControl>this.AbanForm.controls['OfficerNameFormControl']).setValue(item.OfficerName, {});
          (this.AbanForm.controls['OfficerNameFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['BadgeFormControl']).setValue(item.BadgeNum, {});
          (this.AbanForm.controls['BadgeFormControl']).updateValueAndValidity();
          var objdate = new Date(item.DATE);
          // var time =  objdate.getHours() + ':' + objdate.getMinutes() ;//+ ':' + objdate.getSeconds();
          var time = objdate.toTimeString().slice(0, 5);

          (<FormControl>this.AbanForm.controls['DateFormControl']).setValue(objdate, {});
          (this.AbanForm.controls['DateFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['TimeFormControl']).setValue(time, {});
          (this.AbanForm.controls['TimeFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['AddressFormControl']).setValue(item.LOCATION, {});
          (this.AbanForm.controls['AddressFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['BlockNumFormControl']).setValue(item.BlockNum, {});
          (this.AbanForm.controls['BlockNumFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['BusinessFormControl']).setValue(item.Business, {});
          (this.AbanForm.controls['BusinessFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['RequestedByFormControl']).setValue(item.RequestedBy, {});
          (this.AbanForm.controls['RequestedByFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['RequestedByLastFormControl']).setValue(item.RequestedByLast, {});
          (this.AbanForm.controls['RequestedByLastFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['PlateFormControl']).setValue(item.LicNo, {});
          (this.AbanForm.controls['PlateFormControl']).updateValueAndValidity();
          if (item.LicNo == "No Plate") {
            (<FormControl>this.AbanForm.controls['LicPlateUnavailableFormControl']).setValue(true, {});
            (this.AbanForm.controls['LicPlateUnavailableFormControl']).updateValueAndValidity();
          }
          (<FormControl>this.AbanForm.controls['VINFormControl']).setValue(item.VINNUM, {});
          (this.AbanForm.controls['VINFormControl']).updateValueAndValidity();
          if (item.VINNUM == "No VIN") {
            (<FormControl>this.AbanForm.controls['VinUnavailableFormControl']).setValue(true, {});
            (this.AbanForm.controls['VinUnavailableFormControl']).updateValueAndValidity();
          } else {
            this.LoadVinDetails(item.VINNUM);

          }
          // console.log("load- "+item.MakeId);
          if (item.MakeId > 0) {
            this.LoadMake(item.MakeId, item.ModelId);
          } else {
            this.LoadMake(0, 0);
          }
          //this.LoadOfficers(item.OfficerId);
          this.LoadViolationReason(item.ReasonId);
          //this.LoadLocationType(item.LocTypeId);
          this.LoadStates(item.StateId);
          this.LoadStyles(item.StyleId);
          this.LoadColors(item.ColorId);
          /**/
          (<FormControl>this.AbanForm.controls['YearFormControl']).setValue(item.Year, {});
          (this.AbanForm.controls['YearFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['PriorityFormControl']).setValue(item.IsPriority, {});
          (this.AbanForm.controls['PriorityFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['PhoneFormControl']).setValue(item.Phone, {});
          (this.AbanForm.controls['PhoneFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['EmailFormControl']).setValue(item.Email, {});
          (this.AbanForm.controls['EmailFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['MultiVehicleFormControl']).setValue(item.IsMultiVehicle, {});
          (this.AbanForm.controls['MultiVehicleFormControl']).updateValueAndValidity();
          let sendmail = "";
          if (item.SendMail) {
            sendmail = "true";
          } else {
            sendmail = "false";
          }
          (<FormControl>this.AbanForm.controls['EmailOutFormControl']).setValue(sendmail, {});
          (this.AbanForm.controls['EmailOutFormControl']).updateValueAndValidity();
          if (this.VINPlateMatchPermission) {
            let vpmatch = ""
            if (item.VINPlateMatch) {
              vpmatch = "true";
            } else {
              vpmatch = "false";
            }
            (<FormControl>this.AbanForm.controls['VinPlateMatchFormControl']).setValue(vpmatch, {});
            (this.AbanForm.controls['VinPlateMatchFormControl']).updateValueAndValidity();
          }
          if (this.StolenCheckPermission) {
            let stolencheck = ""
            if (item.StolenCheck) {
              stolencheck = "true";
            } else {
              stolencheck = "false";
            }
            (<FormControl>this.AbanForm.controls['StolenCheckFormControl']).setValue(stolencheck, {});
            (this.AbanForm.controls['StolenCheckFormControl']).updateValueAndValidity();
          }else{
            (<FormControl>this.AbanForm.controls['StolenCheckFormControl']).setValue(null, {});
            (<FormControl>this.AbanForm.controls['StolenCheckFormControl']).setValidators(null);
            (this.AbanForm.controls['StolenCheckFormControl']).updateValueAndValidity();
          }

          if (this.IsStolenPermission) {
            (<FormControl>this.AbanForm.controls['IsStolenFormControl']).setValue(item.IsStolen, {});
            (this.AbanForm.controls['IsStolenFormControl']).updateValueAndValidity();

          }



          (<FormControl>this.AbanForm.controls['InstructionsFormControl']).setValue(item.Instructions, {});
          (this.AbanForm.controls['InstructionsFormControl']).updateValueAndValidity();
        } else {
          this.ErrorMsg = "No Record Found"
        }
        this.indLoading = false;
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });

  }
  checkValidInput(type) {
    setTimeout(() => {
      var obj = this.AbanForm.value;
      if (type == "violationreason") {
        if (obj.ViolationReasonFormControl.ABAN_REASON_ID === undefined) {
          this.resetViolationReason();
        }
      } else if (type == "state") {
        if (obj.StateFormControl.StateId === undefined) {
          this.reset();
        }
      } else if (type == "make") {
        if (obj.MakeFormControl.Make_Id === undefined) {
          this.resetMake();
        }
      }
      else if (type == "model") {
        if (obj.ModelFormControl.Model_Id === undefined) {
          this.resetModel();
        }
      } else if (type == "style") {
        if (obj.StyleFormControl.Style_Id === undefined) {
          this.resetStyle();
        }
      } else if (type == "color") {
        if (obj.ColorFormControl.Color_Id === undefined) {
          this.resetColor();
        }
      }
    }, 1000);


  }

  LoadLocationType(typeid): void {
    this.LocationTypeList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetSrchVioLOCType').subscribe(
      list => {
        if (list) {

          this.LocationTypeList = list;

          if (typeid > 0) {
            for (let obj of this.LocationTypeList) {
              if (typeid == obj.LOCATION_TYPE_ID) {
                (<FormControl>this.AbanForm.controls['LocationTypeFormControl'])
                  .setValue(obj, {});

              }
            }
          }
        } else {
          this.LocationTypeList = [];
        }


      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  /*****ViolationReason */
  resetViolationReason(): void {
    setTimeout(() => {
      (this.AbanForm.controls['ViolationReasonFormControl']).setValue(null);
    }, 1);
  }
  filterViolationReasons(val) {
    return val ? this.ViolationReasonList.filter(s => s.ABAN_REASON_DESC.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ViolationReasonList;
  }
  displayFnViolationReason(ViolationReason): string {
    return ViolationReason ? ViolationReason.ABAN_REASON_DESC : null;
  }
  LoadViolationReason(reasonid): void {
    this.ViolationReasonList = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetSrchVioReason').subscribe(
      list => {
        if (list) {

          this.ViolationReasonList = list;
          this.filteredViolationReasons = this.AbanForm.controls['ViolationReasonFormControl'].valueChanges
            .startWith(null)
            .map(ViolationReason => ViolationReason && typeof ViolationReason === 'object' ? ViolationReason.ABAN_REASON_DESC : ViolationReason)
            .map(name => this.filterViolationReasons(name));

          if (reasonid > 0) {
            for (let obj of this.ViolationReasonList) {
              if (reasonid == obj.ABAN_REASON_ID) {
                (<FormControl>this.AbanForm.controls['ViolationReasonFormControl'])
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
  //States
  /*****States */
  reset(): void {
    setTimeout(() => {
      (this.AbanForm.controls['StateFormControl']).setValue(null);
    }, 1);
  }
  filterStates(val) {
    return val ? this.states.filter(s => s.State_Code.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.states;
  }
  displayFn(state): string {
    return state ? state.State_Code : state;
  }
  LoadStates(StateId): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
      .subscribe(states => {
        this.states = states;

        this.filteredStates = this.AbanForm.controls['StateFormControl'].valueChanges
          .startWith(null)
          .map(state => state && typeof state === 'object' ? state.Name : state)
          .map(name => this.filterStates(name));
        if (StateId > 0) {
          for (let state of this.states) {
            if (StateId == state.StateId) {
              (<FormControl>this.AbanForm.controls['StateFormControl'])
                .setValue(state, {});

            }
          }
        } else {
          for (let state of this.states) {
            if (Global.StateId == state.StateId) {
              (<FormControl>this.AbanForm.controls['StateFormControl'])
                .setValue(state, {});

            }
          }

        }
      },
        error => this.ErrorMsg = <any>error);
  }
  /*****Style */
  resetStyle(): void {
    setTimeout(() => {
      (this.AbanForm.controls['StyleFormControl']).setValue(null);
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
        this.filteredStyles = this.AbanForm.controls['StyleFormControl'].valueChanges
          .startWith(null)
          .map(style => style && typeof style === 'object' ? style.Description : style)
          .map(name => this.filterStyles(name));
        if (StyleId > 0) {
          for (let style of this.StyleList) {
            if (StyleId == style.Style_Id) {
              (<FormControl>this.AbanForm.controls['StyleFormControl'])
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
      (this.AbanForm.controls['ColorFormControl']).setValue(null);
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
        this.filteredColors = this.AbanForm.controls['ColorFormControl'].valueChanges
          .startWith(null)
          .map(Color => Color && typeof Color === 'object' ? Color.Description : Color)
          .map(name => this.filterColors(name));
        if (ColorId > 0) {
          for (let Color of this.ColorList) {
            if (ColorId == Color.Color_Id) {
              (<FormControl>this.AbanForm.controls['ColorFormControl'])
                .setValue(Color, {});

            }
          }
        }
      },
        error => this.ErrorMsg = <any>error);
  }
  //Officers
  /*
  LoadOfficers(officerid): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetUsers')
      .subscribe(officers => {
        this.Officers = officers;
        this.filteredOfficers = this.AbanForm.controls['OfficerNameFormControl'].valueChanges
          .startWith(null)
          .map(type => type && typeof type === 'object' ? type.FullName : type)
          .map(name => this.filterOfficers(name));

        if (officerid > 0) {
          for (let obj of this.Officers) {
            if (officerid == obj.User_Id) {
              (<FormControl>this.AbanForm.controls['OfficerNameFormControl'])
                .setValue(obj, {});
            }
          }
        }
      },
        error => this.ErrorMsg = <any>error);
  }

  Officerreset(): void {
    setTimeout(() => {
      (this.AbanForm.controls['OfficerNameFormControl']).setValue(null);
      (this.AbanForm.controls["BadgeFormControl"]).setValue(null, {});
    }, 1);
  }

  filterOfficers(val) {
    return val ? this.Officers.filter(s => s.FullName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.Officers;
  }

  OfficerdisplayFn(type): string {
    return type ? type.FullName : type;
  }

  onSelectOfficer(evt: MatOptionSelectionChange, BadgeNum: any): void {
    if (evt.source.selected) {
      setTimeout(() => {
        //alert(BadgeNum);
        (this.AbanForm.controls["BadgeFormControl"]).setValue(BadgeNum);
        //(this.AbanForm.controls['BadgeFormControl']).updateValueAndValidity();
      }, 1);
    }
  }
*/
  ChangePriority(event) {
    if (event.checked == true) {
      this.IsPriority = true;

    } else {
      this.IsPriority = false;

    }

  }
  ChangeMultiVehicle(event) {
    if (event.checked == true) {
      this.IsMultiVehicle = true;

    } else {
      this.IsMultiVehicle = false;

    }

  }
  ChangeStolen(event) {
    if (event.checked == true) {
      this.IsStolen = true;

    } else {
      this.IsStolen = false;

    }

  }
  ChangeAvailability(event, type: any) {
    if (type == 'vin') {

      if (event.checked == true) {
        this.IsVinUnavailable = false;
        this.AbanForm.controls.VINFormControl.disable();
      } else {
        this.IsVinUnavailable = true;
        this.AbanForm.controls.VINFormControl.enable();
      }
      if (!this.AbanForm.getRawValue().VinUnavailableFormControl) {
        (<FormControl>this.AbanForm.controls['VINFormControl']).setValue('', {});
        (this.AbanForm.controls['VINFormControl']).setValidators(Validators.required);
        (this.AbanForm.controls['VINFormControl']).updateValueAndValidity();
      }
      else {
        (<FormControl>this.AbanForm.controls['VINFormControl']).setValue('No VIN', {});
        (this.AbanForm.controls['VINFormControl']).setValidators(null);
        (this.AbanForm.controls['VINFormControl']).updateValueAndValidity();
      }
    } else if (type == 'license') {
      if (!this.AbanForm.getRawValue().LicPlateUnavailableFormControl) {
        (<FormControl>this.AbanForm.controls['PlateFormControl']).setValue('', {});
        (this.AbanForm.controls['PlateFormControl']).setValidators(Validators.required);
        (this.AbanForm.controls['PlateFormControl']).updateValueAndValidity();
      }
      else {
        (<FormControl>this.AbanForm.controls['PlateFormControl']).setValue('No Plate', {});
        (this.AbanForm.controls['PlateFormControl']).setValidators(null);
        (this.AbanForm.controls['PlateFormControl']).updateValueAndValidity();
      }
    }

  }
  onChange(event: any) {

    this.Isinvalid = false;
    this.vinchange = event.target.value;
    this.LoadVinDetails(this.vinchange);

  }
  LoadVinDetails(vinchange) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GetCarDetails?vinnumber=' + vinchange)
      .subscribe(Vinobj => {

        if (Vinobj == null || Vinobj.length < 1) {
          this.carvin_id = null;
          this.Isinvalid = false;
          //this.AbanForm.controls.YearFormControl.reset();
          //this.AbanForm.controls.MakeFormControl.reset();
          //this.AbanForm.controls.ModelFormControl.reset();
        }
        else {

          this.carvin_id = Number(Vinobj[0].VIN_ID);
          this.Isinvalid = true;
          this.AbanForm.controls.YearFormControl.setValue(Vinobj[0].YEAR);
          this.LoadMake(Number(Vinobj[0].MAKE_ID), Number(Vinobj[0].MODEL_ID))
          // this.AbanForm.controls.MakeFormControl.setValue(Number(Vinobj[0].MAKE_ID));
          //this.LoadModel(Number(Vinobj[0].MAKE_ID));
          // this.AbanForm.controls.ModelFormControl.setValue(Number(Vinobj[0].MODEL_ID));

          // this.AbanForm.controls.OtherMakeFormControl.setValue(null);
          // this.AbanForm.controls.OtherModelFormControl.setValue(null);
          // this.isOtherMakeVisible = false;
          //  (this.AbanForm.controls['OtherMakeFormControl']).setValidators(null);
          // (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();

          // this.isOtherModelVisible = false;
          //(this.AbanForm.controls['OtherModelFormControl']).setValidators(null);
          // (this.AbanForm.controls['OtherModelFormControl']).updateValueAndValidity();
        }
      },
        error => this.ErrorMsg = <any>error);
  }
  /*****Make */
  resetMake(): void {
    setTimeout(() => {
      (this.AbanForm.controls['MakeFormControl']).setValue(null);
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

          this.filteredMakes = this.AbanForm.controls['MakeFormControl'].valueChanges
            .startWith(null)
            .map(Make => Make && typeof Make === 'object' ? Make.Description : Make)
            .map(name => this.filterMakes(name));
        }
        if (makeid > 0) {
          for (let obj of this.MakeList) {
            if (makeid == obj.Make_Id) {
              (<FormControl>this.AbanForm.controls['MakeFormControl'])
                .setValue(obj, {});
              this._dataService.get(Global.DLMS_API_URL + 'api/Model/?MakeId=' + makeid)
                .subscribe(result => {
                  if (result != null && result.length > 0) {
                    this.ModelList = result;
                    this.filteredModels = this.AbanForm.controls['ModelFormControl'].valueChanges
                      .startWith(null)
                      .map(Model => Model && typeof Model === 'object' ? Model.Description : Model)
                      .map(name => this.filterModels(name));

                    if (modelid > 0) {

                      for (let obj of this.ModelList) {
                        if (modelid == obj.Model_Id) {
                          (<FormControl>this.AbanForm.controls['ModelFormControl'])
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
      (<FormControl>this.AbanForm.controls['OtherMakeFormControl']).setValue('', {});
      if (data[0].Description == 'OTHER') {
        this.isOtherMakeVisible = true;
        (this.AbanForm.controls['OtherMakeFormControl']).setValidators(null);
        (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();
      } else {
        this.isOtherMakeVisible = false;
        (this.AbanForm.controls['OtherMakeFormControl']).setValidators(null);
        (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();
      }
    }
  }

  /*****Model */
  resetModel(): void {
    setTimeout(() => {
      (this.AbanForm.controls['ModelFormControl']).setValue(null);
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
          this.filteredModels = this.AbanForm.controls['ModelFormControl'].valueChanges
            .startWith(null)
            .map(Model => Model && typeof Model === 'object' ? Model.Description : Model)
            .map(name => this.filterModels(name));
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }

  changeModel(ev: MatOptionSelectionChange) {

    if (ev.source.selected) {
      let data = this.ModelList.filter((x) => Number(x.Model_Id) == Number(ev.source.value.Model_Id));
      (<FormControl>this.AbanForm.controls['OtherModelFormControl']).setValue('', {});
      if (data[0].Description == 'OTHER') {
        this.isOtherModelVisible = true;
        (this.AbanForm.controls['OtherModelFormControl']).setValidators(null);
        (this.AbanForm.controls['OtherModelFormControl']).updateValueAndValidity();
      } else {
        this.isOtherModelVisible = false;
        (this.AbanForm.controls['OtherModelFormControl']).setValidators(null);
        (this.AbanForm.controls['OtherModelFormControl']).updateValueAndValidity();
      }
    }
  }
  backtolist() {
    //let url = '/abanlist?UserId=' + this.UserId;
    //this.router.navigateByUrl(url);
    window.top.location.href = Global.PoliceURL + "Aban/AbanList.aspx";


  }
  isValid(Aban_desc, DateString) {
    let Record_Date = new Date(DateString);
    let Forty_Hours = new Date(Record_Date);
    Forty_Hours.setHours(Record_Date.getHours() + Number(Global.ABANWAITHOURS))
    let todaydate = this.CurrentDate;
    var returntype: boolean = false;
    //console.log(ID)
    // console.log(Aban_desc);
    //console.log(Record_Date);
    //console.log(Forty_Hours);
    //console.log(todaydate);
    if (Aban_desc == "Abandoned" && todaydate >= Forty_Hours) {

      returntype = true;
    }
    return returntype;
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
  UpdateStatus(AbanId, Status) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    var StatusText = "";
    var statusid;
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
    if (confirm("Do you want to " + StatusText + " this Record# " + this.RecordId + " ?")) {
      var updObj = {
        "AbanId": AbanId,
        "StatusId": statusid,
        "UserId": this.UserId,
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
              this.LoadAbanDetails(AbanId);

            }
          } else {
            this.ErrorMsg = "Record Update Failed. Please try again.";
          }
          this.indLoading = false;
          // this.LoadAbanDetails(AbanId);

        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
    }



  }
  OpenConfirmInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";

    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeConfirmRef() {
    this.modalConfirmRef.hide();
  }

  OpenCancelInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalCancelRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeCancelRef() {
    this.modalCancelRef.hide();
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
  OpenPEOAssignment(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.AbanId = AbanId;
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalAssignRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeAssignRef() {
    this.modalAssignRef.hide();
  }
  OpenEventInfo(template: TemplateRef<any>, AbanId, Olid, recordid) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.IsFiltered = false;
    this.LoadAbanDetails(AbanId);
    this.modalEventRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeEventRef() {
    this.modalEventRef.hide();
  }
  OpenDispatchCreation(template: TemplateRef<any>, AbanId, recordid, isrelocate) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.AbanId = AbanId;
    this.RecordId = recordid;
    this.IsRelocate = isrelocate;
    this.modalDispatchRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md modal-dialog-centered' }));
  }
  closeDispatchRef() {
    this.modalDispatchRef.hide();
  }
  OpenAuditInfo(template: TemplateRef<any>, AbanId, Olid, recordid) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.LoadAbanDetails(AbanId);

    this.modalAuditRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray wid90 modal-dialog-centered' }));
  }
  closeAuditRef() {
    this.modalAuditRef.hide();
  }

  googleAutoComplete() {
    if (Global.GoogleMapAPIKey != '') {
      // this.blockStreetAddressElementRef.nativeElement.focus();
      this.mapsAPILoader.load().then(() => {
        const autocomplete: any = new google.maps.places.Autocomplete(this.AddressElementRef.nativeElement, {
          componentRestrictions: { country: 'US' },
          types: ['address']
        });

        autocomplete.addListener("place_changed", () => {
          this.ngZone.run(() => {
            //get the place result
            let place: google.maps.places.PlaceResult = autocomplete.getPlace();

            //verify result
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            if (place) {
              let address_list = place.address_components;

              let addressModel: AddressModel = {
                street_number: isNullOrUndefined(address_list.find(x => x.types[0] === "street_number")) ? '' : address_list.find(x => x.types[0] === "street_number").short_name,
                street: isNullOrUndefined(address_list.find(x => x.types[0] === "premises")) ? null : address_list.find(x => x.types[0] === "premises").long_name,
                route: isNullOrUndefined(address_list.find(x => x.types[0] === "route")) ? null : address_list.find(x => x.types[0] === "route").long_name,
                zip: isNullOrUndefined(address_list.find(x => x.types[0] === "postal_code")) ? null : address_list.find(x => x.types[0] === "postal_code").short_name,
                city: isNullOrUndefined(address_list.find(x => x.types[0] === "locality")) ? null : address_list.find(x => x.types[0] === "locality").long_name,
                state: isNullOrUndefined(address_list.find(x => x.types[0] === "administrative_area_level_1")) ? null : address_list.find(x => x.types[0] === "administrative_area_level_1").long_name,
                stateShortName: isNullOrUndefined(address_list.find(x => x.types[0] === "administrative_area_level_1")) ? null : address_list.find(x => x.types[0] === "administrative_area_level_1").short_name,
                logitude: isNullOrUndefined(place.geometry.location.lng()) ? null : place.geometry.location.lng().toString(),
                latitude: isNullOrUndefined(place.geometry.location.lat()) ? null : place.geometry.location.lat().toString(),
                formatted_address: isNullOrUndefined(place) ? null : place.formatted_address,
                notavailablegeometry: null
              }
              this.f.AddressFormControl.setValue(addressModel.street_number + ' ' + addressModel.route);

            }
          });
        });

      });
    }
  }
  get f() { return this.AbanForm.controls; }
}
interface AddressModel {
  street_number: string
  street: string
  route: string
  zip: string
  city: string
  state: string
  stateShortName: string
  logitude: string
  latitude: string
  formatted_address: string
  notavailablegeometry: string
}