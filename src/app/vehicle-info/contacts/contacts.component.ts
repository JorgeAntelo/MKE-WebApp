import { Component, OnInit, NgZone } from '@angular/core';
import { Global } from 'src/app/shared/global';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  TowingId: any;
  ContactsList: any;

  phonemask: any[] = Global.phonemask;
  submitted = false;
  submittedPopup = false;
  ContactsForm: FormGroup;
  OfficerTypeList = [];
  ErrorMsg: string;
  SuccessMsg: string;
  error: any = { isError: false, errorMessage: '' };
  UserId: number;
  defaultState = Global.DefaultState;
  servicePaymentData: any;
  subscription: Subscription;


  constructor(
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    private commService: CommunicationService) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.TowingId = params.TID;
      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
    });
    this.subscription = this.commService.getClearCashiering().subscribe(res => {
      if (res) {
        this.ContactsForm.reset();
        const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
        control.controls = [];
        control.push(this.initVehicleInfoItem('', '', '', '', '', ''));

        this.loadDropdowns();
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadDropdowns();
  }

  get permitVehInfoListArrayformData() {
    return <FormArray>this.ContactsForm.get('OfficerListArray');
  }

  get f() { return this.ContactsForm.controls; }

  initForm() {
    this.ContactsForm = this.formBuilder.group({
      OfficerListArray: this.formBuilder.array([])
    });
    const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
    control.controls = [];
    
    control.push(this.initVehicleInfoItem('', '', '', '', '', ''));
    control.push(this.initVehicleInfoItem('', '', '', '', '', ''));
    control.push(this.initVehicleInfoItem('', '', '', '', '', ''));

    control.patchValue([{OfficerTypeId:9},{OfficerTypeId:10},{OfficerTypeId:11}]);
  }

  initVehicleInfoItem(Id, Status, name, officerType, phone, email) {
    return this.formBuilder.group({
      Id: new FormControl(Id),
      Status: new FormControl(Status),
      Name: new FormControl(name, Validators.required),
      Phone: new FormControl(phone, Validators.compose([Validators.required, Validators.pattern(Global.PHONE_REGEX)])),
      Email: new FormControl(email, Validators.compose([Validators.required, Validators.pattern(Global.EMAIL_REGEX)])),
      OfficerTypeId: new FormControl(officerType, Validators.required),
    });
  }

  loadDropdowns() {
    this.loadContacts();
    this.loadOfficerType(0, 0);
  }

  loadOfficerType(loadOfficerTypeId, index) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Common/GetOfficerType')
      .subscribe(response => {
        this.OfficerTypeList = response;
        if (loadOfficerTypeId > 0) {
          for (let obj of this.OfficerTypeList[index]) {
            if (loadOfficerTypeId == obj.loadOfficerTypeId) {
              this.ContactsForm.controls.OfficerListArray['controls'][index].controls['OfficerTypeId'].setValue(obj, {});
            }
          }
        }
        else {
          let data = this.OfficerTypeList.filter(x => x.State_Code == this.defaultState);
          this.f.OfficerTypeId.patchValue(data.length>0?data[0]:0, {});
          this.ContactsForm.controls.OfficerListArray['controls'][index].controls['OfficerTypeId'].setValue(data[0], {});
        }
      },
        error => this.ErrorMsg = <any>error);
  }

  loadContacts() {
    this._dataService.get(Global.DLMS_API_URL + 'api/Request/LoadContacts?TowingId=' + this.TowingId).subscribe(result => {
      if (result.length > 0) {
        this.ContactsList = result;
        const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
        control.patchValue(this.ContactsList);
      } else {
        this.ErrorMsg = result.result;
      }
    },
      error => {
        this.ErrorMsg = <any>error;
      });
  }

  Save() {
    this.ErrorMsg = this.SuccessMsg = '';
    this.submitted = true;
    if (this.ContactsForm.invalid) {
      return;
    }
    let permitModel: PermitModel = new PermitModel();
    permitModel.TowingId = this.TowingId;
    permitModel.UserId = this.UserId;
    const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
    permitModel.OfficerListArray = control.getRawValue();

    this._dataService.post(Global.DLMS_API_URL + 'api/Request/SaveContacts', permitModel).subscribe(result => {
      if (result.Id > 0) {
        this.loadContacts()
        this.SuccessMsg = result.result;
      } else {
        this.ErrorMsg = result.result;
      }
    },
      error => {
        this.ErrorMsg = <any>error;
      });
  }

  integerOnly(event) {
    const e = <KeyboardEvent>event;
    if (e.key === 'Tab' || e.key === 'TAB') {
      return;
    }
    if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  AddNewPermitInfoRow() {
    this.ErrorMsg = this.SuccessMsg = '';
    this.submitted = false;
    const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
    control.push(this.initVehicleInfoItem('', '', '', '', '', ''));
  }

  copyRow(index: number) {
    const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
    this.ErrorMsg = this.SuccessMsg = '';
    this.submitted = true;
    if (control.invalid) {
      return;
    }
    const controlFormArray = <FormArray>this.ContactsForm.controls['OfficerListArray']['controls'][index];
    control.push(
      this.initVehicleInfoItem(
        controlFormArray.controls['Id'].value,
        controlFormArray.controls['Status'].value,
        controlFormArray.controls['OfficerTypeId'].value,
        controlFormArray.controls['Name'].value,
        controlFormArray.controls['Phone'].value,
        controlFormArray.controls['Email'].value)
    );
  }

  deleteRow(index: number) {
    const control = <FormArray>this.ContactsForm.controls['OfficerListArray'];
    control.controls.splice(index, 1);
    control.updateValueAndValidity();
  }
}

class PermitModel {
  TowingId: number;
  UserId: number;
  OfficerListArray: ContactDetailModel[];
}

class ContactDetailModel {
  Id: number;
  OfficerTypeId: any;
  Name: any;
  Phone: any;
  Email: any;
}
