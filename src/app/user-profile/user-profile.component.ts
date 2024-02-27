import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../core/services/data.service';
import { Global } from '../shared/global';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  indLoading: boolean = false;
  phonemask: any[] = Global.phonemask;
  LoaderImage: any;
  ErrorMsg: any; SuccessMsg: any;
  UserForm: FormGroup;
  roles: any[];
  userDetails: any[];
  userId: number;

  constructor(private _dataService: DataService,private route: ActivatedRoute) {

   }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParams['uid'];
    this.UserForm = new FormGroup({
      enableAgencyTow: new FormControl(),
      enableCancel: new FormControl(),
      enablePPI: new FormControl(),
      enableNotes: new FormControl(),
      enableLotAttendant: new FormControl(),
      enableForceUnlock: new FormControl(),     
    });
    this.LoadUserDetails(this.userId);
  }
  LoadUserDetails(UserId: number): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/User/GetUserDetails?uid='+UserId)
    .subscribe(roles => {
      this.userDetails = roles;
      console.log(this.userDetails);
      if(this.userDetails!=null) {
        (<FormControl>this.UserForm.controls['enableAgencyTow']).setValue(this.userDetails[0].showAgencyTowsNotification);
        (<FormControl>this.UserForm.controls['enablePPI']).setValue(this.userDetails[0].showPPINotification);
        (<FormControl>this.UserForm.controls['enableCancel']).setValue(this.userDetails[0].showCancelNotification);
        (<FormControl>this.UserForm.controls['enableNotes']).setValue(this.userDetails[0].showNotesNotification);
        (<FormControl>this.UserForm.controls['enableForceUnlock']).setValue(this.userDetails[0].showForceUnlockNotification); 
        (<FormControl>this.UserForm.controls['enableLotAttendant']).setValue(this.userDetails[0].showLotAttNotesNotification);           
      }
      
    },
    error => this.ErrorMsg = <any>error);
  }
 
  UpdateUser(objUser) {

    this.validateAllFormFields(this.UserForm);
    if (this.UserForm.valid) {
    var objU: UserNotificationModel = new UserNotificationModel();
    objU.userId = this.userId;
    objU.IsAgencyTowsNotification = objUser.enableAgencyTow;
    objU.IsPPINotification = objUser.enablePPI;
    objU.IsCancelNotification = objUser.enableCancel;
    objU.IsNotesNotification = objUser.enableNotes;
    objU.IsForceUnlockNotification = objUser.enableForceUnlock;
    objU.IsLotAttNotesNotification = objUser.enableLotAttendant;
    this.indLoading =true;
    this._dataService.post(Global.DLMS_API_URL + 'api/User/UpdateUserNotification', objU)
    .subscribe(res => {
     
      if (res > 0) {
        this.indLoading =false;
        this.SuccessMsg = Global.UpdateMessage;
      }     
    },
    error => { this.ErrorMsg = <any>error; this.indLoading = false; });
  }
  else {

    this.validateAllFormFields(this.UserForm);
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
}
 class UserNotificationModel
{
   userId: number;
   IsAgencyTowsNotification: boolean;
   IsPPINotification: boolean;
   IsCancelNotification: boolean;
   IsNotesNotification: boolean;
   IsForceUnlockNotification: boolean;
   IsLotAttNotesNotification: boolean;
}