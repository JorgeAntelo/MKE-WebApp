import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef, Inject, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';


@Component({
  selector: 'app-owner-lien-info',
  templateUrl: './owner-lien-info.component.html',
  styleUrls: ['./owner-lien-info.component.css']
})
export class OwnerLienInfoComponent implements OnInit {
  @Input() AbanId: number;
  @Input() UserId: number;
  @Input() states: any;
  @Input() ControlID: any;
  @Input() Count: any;
  @Input() StatusId: number;
  //@Output() emitform= new EventEmitter();


  ErrorMsgOwner: any;
  SuccessMsgOwner: any;
  indLoading: boolean = false;
  LoaderImage: any;
  OwnerForm: FormGroup;
  Owners: FormArray;
  OwnerCount = 0;
  private types = [{ "Name": "Plate Owner" }, { "Name": "Vin Owner" }, { "Name": "Lien" }];
  private OwnerRow = [];
  //states: any[]; filteredStates: Observable<any[]>;
  formSubmitAttempt: boolean;
  private Ownerlist = [];
  private OwnerLienDetail: OwnerLienModel = new OwnerLienModel();
  IsData: boolean = false;
  OwnerId = []; LetterProcessed = [];CanGenerateLetter=[];
  public AllOwnerLienInfo = [];
  HasOwnerforLettergeneration: boolean = false;
  ButtonPermissionList=[];
  btnOLSavePermission : boolean;
btnOLClearPermission : boolean;
btnOLLetterPermission : boolean;
btnOLAddNewPermission : boolean;
btnOLDeletePermission : boolean;
btnOLGlobalSavePermission : boolean;
btnOLGlobalLetterPermission : boolean;
PermissionPageId: number;
  RoleId: number;

  constructor(private _formBuilder: FormBuilder,
    private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private mapsAPILoader: MapsAPILoader,
  ) { }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    if (this.AbanId > 0) {
      this.LoadOwner();
      // this.LoadStates();
      this.LoadUserDetails();
    }

  }
  private createForm() {
    this.OwnerForm = this._formBuilder.group({
      Owners: this._formBuilder.array([])
    });

  }
  LoadButtonPermission(PageId, RoleId): void {

    this.ErrorMsgOwner = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.ButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.ButtonPermissionList.length; i++) {
            if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLSave') { 
              this.btnOLSavePermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLClear') { 
              this.btnOLClearPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLLetter') { 
              this.btnOLLetterPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLAddNew') { 
              this.btnOLAddNewPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLDelete') { 
              this.btnOLDeletePermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLGlobalSave') { 
              this.btnOLGlobalSavePermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnOLGlobalLetter') { 
              this.btnOLGlobalLetterPermission  = Boolean(this.ButtonPermissionList[i]["view_hide"]); 
            }
            
          }
        }
      },
      error => { this.ErrorMsgOwner = <any>error });
  }
  LoadUserDetails() {
    this.PermissionPageId=47;
    //this.ErrorMsg = this.SuccessMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/User/GetUserDetails?uid=' + this.UserId)
      .subscribe(result => {

        if (result != null && result.length > 0) {
          this.RoleId = result[0]["User_Type_Id"];
          this.LoadButtonPermission(this.PermissionPageId, this.RoleId);
        }
        else {
          this.ErrorMsgOwner = "";

        }
      },
      error => {
        this.ErrorMsgOwner = <any>error
      });
  }
  initOwners() {
    return this._formBuilder.group({
      // list of form controls here, which belongs to form array
      TypeFormControl: new FormControl('', [Validators.required]),
      OwnerNameFormControl: new FormControl('', [Validators.required]),
      OwnerAddressFormControl: new FormControl('', [Validators.required]),
      OwnerId: new FormControl('0'),
      //LetterProcessed: new FormControl('0'),
      Address2: new FormControl(''),
      stateCtrl: new FormControl(''),
      City: new FormControl(''),
      Zip: new FormControl('',[Validators.maxLength(5), Validators.pattern(Global.ZIP_REGEX)]),
      /* LetterIds: new FormControl(''),
       LetterDates: new FormControl(''),*/

    });
  }
  get formData() {
    return <FormArray>this.OwnerForm.get('Owners');
  }
  AddOwner() {
    // control refers to your formarray
    const control = <FormArray>this.OwnerForm.controls['Owners'];
    // add new formgroup
    control.push(this.initOwners());
    this.SetState(Global.StateId, control.length - 1);
    this.OwnerCount = control.length;

  }

  RemoveOwner(index: number) {

    if (confirm("Are you sure you want to remove the record ?")) {
      let objClient = this.OwnerForm.value;
      let owner = objClient.Owners[index];

      // control refers to your formarray
      const control = <FormArray>this.OwnerForm.controls['Owners'];

      if (control.length > 1) {
        control.removeAt(index);
        this.OwnerCount = control.length;

        this._dataService.get(Global.DLMS_API_URL + 'api/aban/RemoveOwnerLienDetails?OwnerId='
          + owner.OwnerId + '&Type=' + this.OwnerRow[index] + '&UserId=' + this.UserId)
          .subscribe(OwnerDetails => {
            if (OwnerDetails.result == "Success") {
              this.SuccessMsgOwner = "Delete Operation Success";
            } else {
              this.ErrorMsgOwner = "Delete Operation Failed";
            }
            this.LoadOwner();
          },
            error => this.ErrorMsgOwner = <any>error);
      }
       if (control.length == 1) {
         if(owner.OwnerId >0){
          this._dataService.get(Global.DLMS_API_URL + 'api/aban/RemoveOwnerLienDetails?OwnerId='
          + owner.OwnerId + '&Type=' + this.OwnerRow[index] + '&UserId=' + this.UserId)
          .subscribe(OwnerDetails => {
            if (OwnerDetails.result == "Success") {
              this.SuccessMsgOwner = "Delete Operation Success";
            } else {
              this.ErrorMsgOwner = "Delete Operation Failed";
            }
            this.LoadOwner();
          },
            error => this.ErrorMsgOwner = <any>error);
         }else{
          this.OwnerForm.reset();
         }
         
       }
      // remove the chosen row
    }



  }
  onSelectOwnerType(evt: MatOptionSelectionChange, tp: any, i: number) {
    if (evt.source.selected) {
      //console.log(tp);
      this.OwnerRow[i] = tp.Name;
      //this.XrefIdSearch = tc.TCxrefid;
    }
  }

  ApplyGoogleAddress(id, type): void {
    console.log(id);
    console.log(type);
    console.log(parseInt(id.replace(type, '')));
    if (Global.GoogleMapAPIKey != '') {
      var index = parseInt(id.replace(type, ''));
      var addressElementRef: HTMLInputElement;
      addressElementRef = (<HTMLInputElement>document.getElementById(id));
      let autocomplete: any = new google.maps.places.Autocomplete(addressElementRef, {
        // types: ["address"]
      });
      autocomplete.setFields(['address_components', 'formatted_address', 'geometry', 'icon', 'name']);
      autocomplete.addListener("place_changed", () => {

        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          var street = "";
          var address2 = "";

          //verify result
          if (place.geometry === undefined || place.geometry === null) {

          }
          else {


            for (var i = 0; i < place.address_components.length; i++) {
              var addressType = place.address_components[i].types[0];

              if (addressType == 'street_number') {
                if (place.address_components[i]['short_name'].length > 0) {
                  street = place.address_components[i]['short_name'] + " ";
                }
              }
              if (addressType == 'route') {
                street = street + place.address_components[i]['long_name'];

              }
              if (addressType == "locality") {
                var varcity = place.address_components[i]["long_name"];
                address2 = address2 + varcity + ",";
                //alert("city: " + varcity);
                (this.OwnerForm.controls.Owners['controls'][index].controls['City']).setValue(varcity, {});
              }
              if (addressType == "administrative_area_level_1") {

                var val = place.address_components[i]["short_name"];
                address2 = address2 + val + ",";
                for (let state of this.states) {

                  if (val == state.Code || val == state.Name) {

                    (this.OwnerForm.controls.Owners['controls'][index].controls['stateCtrl'])
                      .setValue(state, {});
                  }
                }
              }

              if (addressType == "postal_code") {
                var varzipcode = place.address_components[i]["short_name"];
                address2 = address2 + varzipcode;
                //alert("zip: " + varzipcode);

                (this.OwnerForm.controls.Owners['controls'][index].controls['Zip']).setValue(varzipcode, {});
              }
            }
            (this.OwnerForm.controls.Owners['controls'][index].controls['OwnerAddressFormControl']).setValue(street, {});
          }


        });
      });
    }
  }
  SetState(State_Id, i): void {

    this.states.forEach(state => {
      if (State_Id == state.StateId) {
        (this.OwnerForm.controls.Owners['controls'][i].controls['stateCtrl'])
          .setValue(state, {});
      }
    });

  }
  /*LoadStates(): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/GetState?CountryId=1')
      .subscribe(states => {
        this.states = states;
        
      },
        error => this.ErrorMsgOwner = <any>error);

  }*/

  Save(objClient, i) {

    let owner = objClient.Owners[i];
    let rawObj = this.OwnerForm.getRawValue();
    let rawowner = rawObj.Owners[i];
    //console.log(rawObj);
    //console.log(rawowner);
    //console.log(owner);
    //console.log(this.Count);
    var slno = parseInt((this.ControlID).replace('OL', ''));

    this.formSubmitAttempt = true;
    this.ErrorMsgOwner = "";
    this.SuccessMsgOwner = "";
    if (this.OwnerForm.valid) {
      this.indLoading = true;
      //objClient.Owners[i]
      this.OwnerLienDetail.SLNO = slno;
      this.OwnerLienDetail.Id = owner.OwnerId;
      this.OwnerLienDetail.AbanId = this.AbanId;
      this.OwnerLienDetail.OwnerLienName = owner.OwnerNameFormControl;
      this.OwnerLienDetail.Address2 = rawowner.City + "," + rawowner.stateCtrl.State_Code + "," + rawowner.Zip;
      if (Global.GoogleMapAPIKey != '') {
        this.OwnerLienDetail.Address1 = owner.OwnerAddressFormControl;
      }
      else {
        this.OwnerLienDetail.Address1 = owner.OwnerAddressFormControl;

      }
      this.OwnerLienDetail.OwnerLicense = null;
      this.OwnerLienDetail.City = rawowner.City;
      this.OwnerLienDetail.State = rawowner.stateCtrl.State_Code;
      this.OwnerLienDetail.Zipcode = rawowner.Zip;
      this.OwnerLienDetail.Type = rawowner.TypeFormControl.Name;
      this.OwnerLienDetail.CreatedBy = this.UserId;
      this.OwnerLienDetail.ModifiedBy = this.UserId;
      var ownermodelarray = [];
      ownermodelarray.push(this.OwnerLienDetail);


      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/SaveAbanOwnerLienDetails', ownermodelarray)
        .subscribe(OwnerDetails => {
          if (OwnerDetails.Id > 0) {
            if (owner.OwnerId > 0) {
              this.SuccessMsgOwner = Global.UpdateMessage;
              //this.OwnerId[i]=0;
            }
            else {
              this.SuccessMsgOwner = Global.SaveMessage;
              owner.OwnerId = OwnerDetails.Id;
            }
            // this.ClientId = ClientDetails.Id;
            this.OwnerForm.reset();
            this.formSubmitAttempt = false;
            //    this.IsSaveClient = false;
            this.indLoading = false;
            this.LoadOwner();
            //this.StorageLotForm.reset();

          }
          else if (OwnerDetails.Id == -2) {
            this.ErrorMsgOwner = Global.UniqueEmailUserFailed;
            this.indLoading = false;
            return;
          }
          this.formSubmitAttempt = false;
        },
          error => this.ErrorMsgOwner = <any>error);
      this.indLoading = false;
    }
    else {
      //this.validateAllFormFields(this.OwnerForm.controls.Owners['controls'][i]);
      //this.validateAllFormFields(this.OwnerForm);
      if (objClient.Owners.length > 0) {
        for (var k = 0; k < objClient.Owners.length; k++) {
          this.validateAllFormFields(this.OwnerForm.controls.Owners['controls'][k]);
        }
      }
    }
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
  LoadOwner(): void {
    this.HasOwnerforLettergeneration = false;
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/SelectAbanOwnerLienDetails?OwnerLienId=0&AbanId=' + this.AbanId)
      .subscribe(Ownerlist => {
        if (Ownerlist != "") {
          this.Ownerlist = Ownerlist;
          // console.log(JSON.stringify(this.Ownerlist));
          this.IsData = true;

          const arr = <FormArray>this.OwnerForm.controls.Owners;
          arr.controls = [];

          let i = 0;
          Ownerlist.forEach(owner => {
            this.CanGenerateLetter[i] = false;
            this.AddOwner();
            (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerNameFormControl'])
              .setValue(owner.Owner_Lien_Name, {});
            (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerAddressFormControl'])
              .setValue(owner.Address1, {});
            (this.OwnerForm.controls.Owners['controls'][i].controls['City'])
              .setValue(owner.City, {});

            (this.OwnerForm.controls.Owners['controls'][i].controls['Zip'])
              .setValue(owner.Zipcode, {});
            (this.OwnerForm.controls.Owners['controls'][i].controls['Address2'])
              .setValue(owner.Address2, {});
            (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerId'])
              .setValue(owner.Id, {});
            /*(this.OwnerForm.controls.Owners['controls'][i].controls['LetterProcessed'])
                       .setValue(owner.LetterProcessed, {});
                   (this.OwnerForm.controls.Owners['controls'][i].controls['LetterIds'])
                       .setValue(owner.Letters, {});
                   (this.OwnerForm.controls.Owners['controls'][i].controls['LetterDates'])
                       .setValue(owner.LetterIds, {});*/
            /*if (owner.LetterVisible == 0) {
                (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerNameFormControl'])
                    .disable();
                (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerAddressFormControl'])
                    .disable();
            }*/
            this.OwnerId[i] = owner.Id;
            this.LetterProcessed[i] = owner.LetterVisible;
            this.SetState(owner.State_Id, i);



            this.types.forEach(type => {
              if (owner.Type == type.Name) {
                this.OwnerRow[i] = owner.Type;
                (this.OwnerForm.controls.Owners['controls'][i].controls['TypeFormControl'])
                  .setValue(type, {});
                /* (this.OwnerForm.controls.Owners['controls'][i].controls['TypeFormControl'])
                     .disable();*/
              }
            });
            if (owner.Id > 0 && (this.StatusId > 1 && this.StatusId != 4) &&  owner.LetterVisible) {
              this.CanGenerateLetter[i] = true;
              this.HasOwnerforLettergeneration = true;

            } else {
              this.CanGenerateLetter[i] = false;
            }
            i++;
          });

        }
        else {
          this.AddOwner();
          this.IsData = false;


        }
      },
        error => this.ErrorMsgOwner = <any>error);
  }

  ClearOwner(i) {
    (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerNameFormControl'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerAddressFormControl'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['City'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['stateCtrl'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['Zip'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['Address2'])
      .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['OwnerId'])
      .setValue(0, {});
    /*(this.OwnerForm.controls.Owners['controls'][i].controls['LetterProcessed'])
        .setValue(0, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['LetterIds'])
        .setValue(null, {});
    (this.OwnerForm.controls.Owners['controls'][i].controls['LetterDates'])
        .setValue(null, {});*/

    this.ErrorMsgOwner = "";
    this.SuccessMsgOwner = "";
    /* this.OwnerForm.controls['OwnerNameFormControl'].setValue(null)
     this.OwnerForm.controls['OwnerAddressFormControl'].setValue(null)
     this.OwnerForm.controls['OwnerLettersFormControl'].setValue(null)
     this.ErrorMsgOwner = "";
     this.SuccessMsgOwner = "";
     this.OwnerId = 0;
     this.OwnerForm.reset();*/
  }
  CreateOwnerletter(Type, OwnerId) {

    //calling  an api to generate the letter and save it against the Owner and lien  in attachments,townotifydates tables 
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GenerateAbanletter?AbanIds=' + this.AbanId + '&Ids=' + OwnerId + '&Type=' + Type + '&UserId=' + this.UserId)
      .subscribe(objresult => {
        console.log(objresult);
        if (objresult != "NA") {
          this.SuccessMsgOwner = 'Notification sent successfully';

          //open the letter in a new window
          if (Type != "Lien") {
            window.open("" + Global.ReportPath + "?reportName=TowCs&TowingId=" + this.AbanId + "&OwnerId=" + OwnerId + "&LienId=0", "_blank");
          }
          else {
            window.open("" + Global.ReportPath + "?reportName=TowCs&TowingId=" + this.AbanId + "&OwnerId=0&LienId=" + OwnerId, "_blank");
          }
        }

        this.formSubmitAttempt = false;
      },
        error => this.ErrorMsgOwner = <any>error);

  }

  CreateAllOwnerletter() {

    //calling  an api to generate the letter and save it against the Owner and lien  in attachments,townotifydates tables 
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/GenerateAbanletter?AbanIds=' + this.AbanId + '&Ids=-1' + '&Type=&UserId=' + this.UserId)
      .subscribe(objresult => {
        console.log(objresult);
        if (objresult != "NA") {
          this.SuccessMsgOwner = 'Notification sent successfully';
          //open the combined letter in a new window
          window.open("" + Global.PoliceURL + "/Officer/DocViewer.aspx?file=" + objresult, "_blank");

        }

        this.formSubmitAttempt = false;
      },
        error => this.ErrorMsgOwner = <any>error);

  }
  displayFnType(type): string {
    return type ? type.Name : type;
  }

  ResetOwnerType(i: any): void {
    setTimeout(() => {
      (this.OwnerForm.controls.Owners['controls'][i].controls['TypeFormControl']).setValue(null);
      this.OwnerRow[i] = null;
    }, 1);
  }


}
class OwnerLienModel {

  SLNO: number;
  Id: number;
  AbanId: number;
  OwnerLienName: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zipcode: number;
  CreatedBy: number;
  ModifiedBy: number;
  OwnerLastName: string;
  OwnerLicense: string;
  Type: string;

}

class LienModel {
  LienId: number;
  AbanId: number;
  LienHolderName: string;
  Address: string;
  UserId: number;
}
class NotificationModel {
  LienId: number;
  AbanId: number;
  OwnerId: number;
  UserId: number;
}