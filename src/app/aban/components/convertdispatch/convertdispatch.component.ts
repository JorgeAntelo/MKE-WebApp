import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef, Inject, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
  selector: 'app-convertdispatch',
  templateUrl: './convertdispatch.component.html',
  styleUrls: ['./convertdispatch.component.css']
})
export class ConvertdispatchComponent implements OnInit {
  @Input() AbanId: number;
  @Input() UserId: number;
  @Input() IsRelocate: number;
  ErrorMsg: any;
  SuccessMsg: any;
  indLoading: boolean = false;
  LoaderImage: any;
  ConvertForm: FormGroup;
  IsPriority: boolean = false;
  towreasons = [];filteredReasons: Observable<any[]>;
  constructor(private _dataService: DataService,
    private router: Router, ) { }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.LoadTowReasons(0);
  }
  createForm() {
    this.ConvertForm = new FormGroup({
      ReasonFormControl: new FormControl('', [Validators.required]),
      // PriorityFormControl: new FormControl(''),
      NotesFormControl: new FormControl('')

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
  ChangePriority(event) {


    if (event.checked == true) {
      this.IsPriority = true;
    } else {
      this.IsPriority = false;
    }
  }
  /*****TowReason */
  resetReason(): void {
    setTimeout(() => {
      (this.ConvertForm.controls['ReasonFormControl']).setValue(null);
    }, 1);
  }
  filterReasons(val) {
    return val ? this.towreasons.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.towreasons;
  }
  displayFnReason(Reason): string {
    return Reason ? Reason.Description : Reason;
  }
  LoadTowReasons(typeid): void {
    this.towreasons = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/TowingReasons').subscribe(
      list => {
        if (list) {
          this.towreasons = list;
          this.filteredReasons = this.ConvertForm.controls['ReasonFormControl'].valueChanges
            .startWith(null)
            .map(Reason => Reason && typeof Reason === 'object' ? Reason.Description : Reason)
            .map(name => this.filterReasons(name));
        } else {
          this.towreasons = [];
        }
      },
      error => (this.ErrorMsg = <any>error)
    );
  }
  Save(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    this.validateAllFormFields(this.ConvertForm);
    if (this.ConvertForm.valid) {
      this.indLoading = true;


      var updObj = {
        "AbanId": this.AbanId,
        "StatusId": 3,
        "UserId": this.UserId,
        "Notes": obj.NotesFormControl,
        "IsRelocate": this.IsRelocate > 0 ? true : false,
        //"IsPriority": this.IsPriority,
        "TowReasonId": obj.ReasonFormControl.Tow_Reason_Id
      };
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/UpdateBAN', updObj)
        .subscribe(response => {
          if (response > 0) {
            this.SuccessMsg = "Record Updated Successfully.";

            this.indLoading = false;
            window.top.location.href = Global.PoliceURL + "Request/Request.aspx?Id=" + response;


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
}
