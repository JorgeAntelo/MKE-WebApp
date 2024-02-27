
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';
import { isNullOrUndefined } from 'util';
import { DatePipe } from '@angular/common'
@Component({
  selector: 'app-scraprevert',
  templateUrl: './scraprevert.component.html',
  styleUrls: ['./scraprevert.component.css'],
  styles: [`
  
      ::ng-deep .mat-calendar-body-cell-content {
          font-size:10px;
          
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
export class ScraprevertComponent implements OnInit {
  ErrorMsg: any;
  SuccessMsg: any;
  SearchForm: FormGroup;
  ScrapRevertForm: FormGroup;

  indLoading: boolean;
  LoaderImage: any;
  RecordId: any; UserId: Number;
  PageId: any;
  RoleId: number;
  Header: any = "Scrap Revert";
  RevertStatusList: any[] = null;
  VehicleDetails: any;
  IsInterval: any;
  btnScrapRevert: boolean = true;
  IsStorageStatusValid: boolean = false;
  IsReverttoReceive: boolean = false;
  DisableDisposalEdit: boolean = true;
  ScrapReceived: boolean = false;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router, private modalService: BsModalService,
    private utilService: UtilService, public datepipe: DatePipe) {
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

    window.addEventListener('message', function (event) {
      this.localStorage.setItem('scroll_top', event.data);
    });

  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.LoadScrapRevertStatus();
  }

  createForm() {
    this.SearchForm = new FormGroup({
      RecordIdFormControl: new FormControl('', [Validators.required])
    });
    this.ScrapRevertForm = new FormGroup({
      TowedDateFormControl: new FormControl({ value: '', disabled: true }),
      ReceivedDateFormControl: new FormControl({ value: '', disabled: true }),
      VinFormControl: new FormControl({ value: '', disabled: true }),
      LicensePlateFormControl: new FormControl({ value: '', disabled: true }),
      TowedStatusFormControl: new FormControl({ value: '', disabled: true }),
      RevertStatusFormControl: new FormControl('', [Validators.required]),
      PotentialDisposalStatusFormControl: new FormControl({ value: '', disabled: true }),
      ProjectedRevenueFormControl: new FormControl({ value: '', disabled: true }),
      ProcessDateFormControl: new FormControl({ value: '', disabled: true }),
      PotentialDisposalDateFormControl: new FormControl(''),
      keepPotentialDisposalFormControl: new FormControl(''),
      ScrapStatusFormControl: new FormControl({ value: '', disabled: true }),
    });

  }
  Search() {
    this.IsStorageStatusValid = false;
    this.IsReverttoReceive = false;
    this.ScrapReceived = false;
    this.ErrorMsg = this.SuccessMsg = "";
    this.utilService.validateAllFormFields(this.SearchForm);
    if (this.SearchForm.valid) {
      let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
      this._dataService.get(Global.DLMS_API_URL + 'tow/GetTowingDetailsByRecordId?RecordId=' + RecordId + '&UserId=' + this.UserId)
        .subscribe(result => {
          if (result != null && result.length > 0) {
            this.VehicleDetails = result[0];

            if (this.VehicleDetails.ScrapReceived == 1) {
              this.ScrapReceived = true;
            }

            (<FormControl>this.ScrapRevertForm.controls['TowedDateFormControl']).setValue(this.datepipe.transform(this.VehicleDetails.Vehicle_Towed_Date, 'MM/dd/yyyy'), {});
            (this.ScrapRevertForm.controls['TowedDateFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['ReceivedDateFormControl']).setValue(this.datepipe.transform(this.VehicleDetails.Vehicle_Received_Date, 'MM/dd/yyyy'), {});
            (this.ScrapRevertForm.controls['ReceivedDateFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['VinFormControl']).setValue(this.VehicleDetails.Vehicle_VinNum, {});
            (this.ScrapRevertForm.controls['VinFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['LicensePlateFormControl']).setValue(this.VehicleDetails.License_PlateNum, {});
            (this.ScrapRevertForm.controls['LicensePlateFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['TowedStatusFormControl']).setValue(this.VehicleDetails.Storage_Status, {});
            (this.ScrapRevertForm.controls['TowedStatusFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalStatusFormControl']).setValue(this.VehicleDetails.PotentialDispositionStatus == 'S' ? 'Scrap' : '', {});
            (this.ScrapRevertForm.controls['PotentialDisposalStatusFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['ProjectedRevenueFormControl']).setValue(this.VehicleDetails.ProjectedRevenue, {});
            (this.ScrapRevertForm.controls['ProjectedRevenueFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['ProcessDateFormControl']).setValue(this.datepipe.transform(this.VehicleDetails.ProcessDate, 'MM/dd/yyyy'), {});
            (this.ScrapRevertForm.controls['ProcessDateFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).setValue(this.VehicleDetails.PotentialDispositionDate, {});
            (this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).updateValueAndValidity();
            (<FormControl>this.ScrapRevertForm.controls['ScrapStatusFormControl']).setValue(this.VehicleDetails.ScrapReceived == 1 ? "Scrap Received" : '', {});
            (this.ScrapRevertForm.controls['ScrapStatusFormControl']).updateValueAndValidity();
            if (this.VehicleDetails.Storage_Status_Id == 8 && this.VehicleDetails.ScrapReceived != 1) {
              this.IsStorageStatusValid = true;
              (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).disable();
              (this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).updateValueAndValidity();
            }
            else {
              this.ErrorMsg = "Invalid Record Id. Vehicles with Scrap Release status can be Reverted only"
            }
          }
          else {
            this.ErrorMsg = "No records found";
          }


        },
        error => {
          this.ErrorMsg = <any>error
        });
    }
  }
  Cancel() {
    this.SearchForm.reset();
    this.ScrapRevertForm.reset();
    this.ErrorMsg = this.SuccessMsg = false;
    this.IsStorageStatusValid = false;
    this.IsReverttoReceive = false;
    this.ScrapReceived = false;
  }
  LoadScrapRevertStatus(): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapRevertStatus')
      .subscribe(result => {
        this.RevertStatusList = result;
        /*  (<FormControl>this.SearchForm.controls["ImpoundDateBeforeFormControl"]).setValue(this.DaysList[0].DayId);
         this.LoadTowList(this.SearchForm); */
      },
      error => {
        this.ErrorMsg = <any>error
      });

  }
  Save(obj: any) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.utilService.validateAllFormFields(this.ScrapRevertForm);
    if (this.ScrapRevertForm.valid) {

      let lPotentialDisposalDate = null;
      if (obj.keepPotentialDisposalFormControl) {
        let lDate = new Date(this.ScrapRevertForm.value.PotentialDisposalDateFormControl);

        lPotentialDisposalDate = lDate ? (lDate.getMonth() + 1) + '/' + lDate.getDate() + '/' + lDate.getFullYear() : '';
      }

      this.indLoading = true;
      var RevertModel =
        {
          "TowingId": this.VehicleDetails.Towing_Id,
          "RevertToStatus": obj.RevertStatusFormControl.Status_Id,
          "KeepPotentialDisposalInfo": obj.keepPotentialDisposalFormControl,
          "PotentialDisposalDate": lPotentialDisposalDate,
          "UserId": this.UserId

        };

      this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/RevertScrapReleased', RevertModel)
        .subscribe(items => {
          this.indLoading = false;

          if (items.Id > 0) {

            this.Search();
            this.SuccessMsg = items.result;
            this.ErrorMsg = "";
          } else {
            this.ErrorMsg = items.result;
          }
        },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
    }
  }

  onKeepChange(obj: any) {

    if (obj.checked) {
      (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).enable();
      (this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).updateValueAndValidity();
    }
    else {
      (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).disable();
      (this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).updateValueAndValidity();
    }
  }
  onRevretToChange() {
    this.IsReverttoReceive = false;
    (<FormControl>this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).disable();
    (this.ScrapRevertForm.controls['PotentialDisposalDateFormControl']).updateValueAndValidity();
    if ((<FormControl>this.ScrapRevertForm.controls['RevertStatusFormControl']).value) {
      if ((<FormControl>this.ScrapRevertForm.controls['RevertStatusFormControl']).value.Status_Id == 2) {
        this.IsReverttoReceive = true;
      }
    }
  }

}

