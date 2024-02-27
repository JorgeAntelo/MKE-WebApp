import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-citizenaban',
  templateUrl: './citizenaban.component.html',
  styleUrls: ['./citizenaban.component.css']
})
export class CitizenabanComponent implements OnInit {
  @ViewChild('templateConfirm') public templateConfirm: TemplateRef<any>;
  @ViewChild('templateCancel') public templateCancel: TemplateRef<any>;
  @ViewChild('templateAssign') public templateAssign: TemplateRef<any>;
  public modalConfirmRef: BsModalRef;
  public modalCancelRef: BsModalRef;
  public modalAssignRef: BsModalRef;
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
  Header: any = "Parking Complaint";
  IsDispatchEligible: boolean = false;
  IsAdmin: boolean = false;
  ComplaintNo: any; HasComplaintNo: boolean = false; IsInterval: any; IsAban: boolean;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
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

      if (token != '0' && token != '-1' && token != '') {
        this._dataService.get(Global.DLMS_API_URL + 'api/Aban/getAbanIdfromToken?token=' + token)
          .subscribe(id => {
            this.createForm();
            this.LoadAbanDetails(id);
          }, error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
      } else {
        if (AbanId) {
          this.createForm();
          this.LoadAbanDetails(AbanId);
        }
      }


    });
  }
  ngAfterViewInit() {
    this.LoaderImage = Global.FullImagePath;
    // console.log("call ngAfterViewInit");
  }
  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.CurrentDate = new Date();
    this.StatusId = 1;
    this.LoadViolationReason(0);
    //this.LoadOfficers(0);
    //this.LoadLocationType(0);
    this.LoadStates(0);
    this.LoadMake(0, 0);
    this.LoadStyles(0);
    this.LoadColors(0);
    this.createForm();
    this.LoadCancelReasons();
    this.LoadPEOfficers();
  }
  private createForm() {
    this.AbanForm = new FormGroup({
      OfficerNameFormControl: new FormControl(''),
      BadgeFormControl: new FormControl(''),
      DateFormControl: new FormControl(''),
      TimeFormControl: new FormControl(''),
      AddressFormControl: new FormControl('', [Validators.required]),
      ViolationReasonFormControl: new FormControl('', [Validators.required]),
     // LocationTypeFormControl: new FormControl('', [Validators.required]),
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
      StyleFormControl: new FormControl(''),
      ColorFormControl: new FormControl(''),
      EmailOutFormControl: new FormControl(''),
    });

    this.SetValueandValidation(this.IsCitizenRequest);

  }
  SetValueandValidation(iscitizen) {
    var objdate = new Date();
    var time = objdate.toTimeString().slice(0, 5);//objdate.getHours() + ':' + objdate.getMinutes() ;

    if (iscitizen == 1) {
      (<FormControl>this.AbanForm.controls['RequestedByFormControl']).setValidators([Validators.required]);
      (this.AbanForm.controls['RequestedByFormControl']).updateValueAndValidity();
      (<FormControl>this.AbanForm.controls['RequestedByLastFormControl']).setValidators([Validators.required]);
      (this.AbanForm.controls['RequestedByLastFormControl']).updateValueAndValidity();
      (<FormControl>this.AbanForm.controls['PhoneFormControl']).setValidators([Validators.required, Validators.maxLength(15), Validators.pattern(Global.PHONE_REGEX)]);
      (this.AbanForm.controls['PhoneFormControl']).updateValueAndValidity();
      (<FormControl>this.AbanForm.controls['EmailFormControl']).setValidators([Validators.required, Validators.pattern(Global.EMAIL_REGEX), Validators.maxLength(50)]);
      (this.AbanForm.controls['EmailFormControl']).updateValueAndValidity();
     // (<FormControl>this.AbanForm.controls['LocationTypeFormControl']).setValidators(null);
     // (this.AbanForm.controls['LocationTypeFormControl']).updateValueAndValidity();
    }
    (<FormControl>this.AbanForm.controls['DateFormControl']).setValue(objdate, {});
    (this.AbanForm.controls['DateFormControl']).updateValueAndValidity();
    (<FormControl>this.AbanForm.controls['TimeFormControl']).setValue(time, {});
    (this.AbanForm.controls['TimeFormControl']).updateValueAndValidity();
  }
  AddNew() {

    this.ResetForm();
    let url = '/aban?UserId=' + this.UserId;
    this.router.navigateByUrl(url);
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
      var objdate = new Date();
      var time = objdate.toTimeString().slice(0, 5);
      (<FormControl>this.AbanForm.controls['DateFormControl']).setValue(objdate, {});
      (this.AbanForm.controls['DateFormControl']).updateValueAndValidity();
      (<FormControl>this.AbanForm.controls['TimeFormControl']).setValue(time, {});
      (this.AbanForm.controls['TimeFormControl']).updateValueAndValidity();

      this.indLoading = true;
      var vinid = null;
      if (this.carvin_id) {
        vinid = this.carvin_id;

      }
      //console.log(this.UserId);
      var abanobj =
        {
          "AbanId": this.AbanId,
          "UserId": this.UserId,
          "OfficerName": obj.OfficerNameFormControl,
          "BadgeNo": obj.BadgeFormControl,
          "Time": obj.TimeFormControl,
          "Date": obj.DateFormControl,
          "ViolationReasonId": obj.ViolationReasonFormControl.ABAN_REASON_ID,
          "Location": obj.AddressFormControl,
          "ViolationTypeId": 0,//obj.LocationTypeFormControl.LOCATION_TYPE_ID,
          "BusName": obj.BusinessFormControl,
          "Rname": obj.RequestedByFormControl,
          "Lname": obj.RequestedByLastFormControl,
          "LicNo": obj.PlateFormControl,
          "StateId": obj.StateFormControl.StateId,
          //"carvin_id": vinid,
          "Year": obj.YearFormControl,
          "MakeId": obj.MakeFormControl.Make_Id,
          "ModelId": obj.ModelFormControl.Model_Id,
          "Vin": obj.VINFormControl,
          "Style": obj.VINFormControl,
          "StyleId": obj.StyleFormControl.Style_Id,
          "ColorId": obj.ColorFormControl.Color_Id,
          "Phone": obj.PhoneFormControl,
          "Email": obj.EmailFormControl,
          "Instructions": obj.InstructionsFormControl,
          "IsPriority": false,
          "SendMail":true
        };
      //console.log(abanobj);
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
            if (origAbanId == 0) {
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
      "LastName":"",
      "IsTimeLapsed":false,
      "EnteredBy":0
    };

    this.indLoading = true;
    this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Search', searchobj)
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
          this.IsDispatchEligible = item.IsDispatchEligible;
          if (item.ComplaintNo) {
            this.ComplaintNo = item.ComplaintNo;
            this.HasComplaintNo = true;
          } else {
            this.HasComplaintNo = false;
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

          (<FormControl>this.AbanForm.controls['PhoneFormControl']).setValue(item.Phone, {});
          (this.AbanForm.controls['PhoneFormControl']).updateValueAndValidity();
          (<FormControl>this.AbanForm.controls['EmailFormControl']).setValue(item.Email, {});
          (this.AbanForm.controls['EmailFormControl']).updateValueAndValidity();
          // (<FormControl>this.AbanForm.controls['EmailOutFormControl']).setValue(item.SendEmail, {});
          // (this.AbanForm.controls['EmailOutFormControl']).updateValueAndValidity();
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
    return ViolationReason ? ViolationReason.ABAN_REASON_DESC : ViolationReason;
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
  /*LoadLocationType(typeid): void {
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
  }*/
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
          this.AbanForm.controls.MakeFormControl.setValue(Number(Vinobj[0].MAKE_ID));
          this.LoadModel(Number(Vinobj[0].MAKE_ID));
          this.AbanForm.controls.ModelFormControl.setValue(Number(Vinobj[0].MODEL_ID));

          this.AbanForm.controls.OtherMakeFormControl.setValue(null);
          this.AbanForm.controls.OtherModelFormControl.setValue(null);
          this.isOtherMakeVisible = false;
          (this.AbanForm.controls['OtherMakeFormControl']).setValidators(null);
          (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();

          this.isOtherModelVisible = false;
          (this.AbanForm.controls['OtherModelFormControl']).setValidators(null);
          (this.AbanForm.controls['OtherModelFormControl']).updateValueAndValidity();
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
                }else{
                  this.LoadModel(0);
                }
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
        (this.AbanForm.controls['OtherMakeFormControl']).setValidators(Validators.required);
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
        (this.AbanForm.controls['OtherModelFormControl']).setValidators(Validators.required);
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
    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }
  closeConfirmRef() {
    this.modalConfirmRef.hide();
  }

  OpenCancelInfo(template: TemplateRef<any>, AbanId, Olid, recordid, StatusId) {
    this.AbanId = AbanId;
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalCancelRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
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
    this.ControlID = Olid;
    this.RecordId = recordid;
    this.StatusId = StatusId;

    this.modalAssignRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }
  closeAssignRef() {
    this.modalAssignRef.hide();
  }
}
