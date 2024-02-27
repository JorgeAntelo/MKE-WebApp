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
import { CitationissuedComponent } from './../citationissued/citationissued.component'

@Component({
  selector: 'app-cancelaban',
  templateUrl: './cancelaban.component.html',
  styleUrls: ['./cancelaban.component.css']
})
export class CancelabanComponent implements OnInit {
  @Input() RecordId: number;
  @Input() AbanId: number;
  @Input() UserId: number;
  @Input() cancelreasons: any;
  @Input() ControlID: any;
  @Input() Count: any;
  @Input() StatusId: number;
  @Input() CancelReasonId: number;
  @Input() CancelNotes: number;

  @Output() OnSave = new EventEmitter();

  ErrorMsg: any;
  SuccessMsg: any;
  indLoading: boolean = false;
  LoaderImage: any;
  CancelForm: FormGroup;
  hasCitations: boolean = false;
  hasTowReasons: boolean = false;
  towreasons = []; filteredReasons: Observable<any[]>;
  IsRelocate: boolean = false; IsTwentyFour: boolean = true; IsVehicleTimed: boolean = false;
  @ViewChild(CitationissuedComponent) citations: CitationissuedComponent;
  constructor(private _dataService: DataService,
    private router: Router, ) {

  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.LoadCancelDetails();
    this.LoadTowReasons(0);
  }
  createForm() {
    this.CancelForm = new FormGroup({
      CloseReasonFormControl: new FormControl(''),
      NotesFormControl: new FormControl(''),
      ReasonFormControl: new FormControl(''),
      RelocateFormControl: new FormControl(''),
      WaitTimeFormControl: new FormControl('true'),
      //DispatchNotesFormControl: new FormControl(''),
    });
  }

  ChangeRelocate(event) {


    if (event.checked == true) {
      this.IsRelocate = true;
    } else {
      this.IsRelocate = false;
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
  LoadCancelDetails() {
    (<FormControl>this.CancelForm.controls['NotesFormControl']).setValue(this.CancelNotes, {});
    (this.CancelForm.controls['NotesFormControl']).updateValueAndValidity();
    //for (var i = 0; i < this.cancelreasons.length; i++) {
    //let reason = this.cancelreasons[i];
    //if (reason.ReasonId == this.CancelReasonId) {
    (<FormControl>this.CancelForm.controls['CloseReasonFormControl']).setValue(this.CancelReasonId, {});
    (this.CancelForm.controls['CloseReasonFormControl']).updateValueAndValidity();
    //}
    //}
  }
  showCitations(evt) {
    (<FormControl>this.CancelForm.controls['ReasonFormControl']).setValidators(null);
    (this.CancelForm.controls['ReasonFormControl']).updateValueAndValidity();

    if (evt.value.ReasonId == 4) {
      this.hasCitations = true;
      this.hasTowReasons = false;
      this.IsVehicleTimed = false;
    } else if (evt.value.ReasonId == 2) {
      this.hasTowReasons = true;
      this.hasCitations = false;
      this.IsVehicleTimed = false;
      (<FormControl>this.CancelForm.controls['ReasonFormControl']).setValidators([Validators.required]);
      (this.CancelForm.controls['ReasonFormControl']).updateValueAndValidity();
    } else if (evt.value.ReasonId == 8) {
      this.IsVehicleTimed = true;
      this.hasTowReasons = false;
      this.hasCitations = false;

    } else {
      this.hasTowReasons = false;
      this.hasCitations = false;
      this.IsVehicleTimed = false;
    }
  }
  /*****TowReason */
  resetReason(): void {
    setTimeout(() => {
      (this.CancelForm.controls['ReasonFormControl']).setValue(null);
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
          this.filteredReasons = this.CancelForm.controls['ReasonFormControl'].valueChanges
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

  ConvertDispatch(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    var citationlist = [];
    let reasonid = null;

    this.validateAllFormFields(this.CancelForm);
    if (this.CancelForm.valid) {
      this.indLoading = true;
      var notes = '';
      if (obj.NotesFormControl) {
        notes = obj.NotesFormControl;
      }

      var updObj = {
        "AbanId": this.AbanId,
        "StatusId": 3,
        "UserId": this.UserId,
        "Notes": notes,
        "IsRelocate": this.IsRelocate,
        //"IsPriority": this.IsPriority,
        "TowReasonId": obj.ReasonFormControl.Tow_Reason_Id
      };
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/UpdateBAN', updObj)
        .subscribe(responseid => {

          if (responseid > 0) {
            this.SuccessMsg = "Vehicle Closed/Towed Successfully.";
            this.StatusId = 3;
           // window.top.location.href = Global.PoliceURL + "Request/Request.aspx?Id=" + responseid;

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
  ConvertVehicleTimed(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";

    let reasonid = null;
    if (obj.WaitTimeFormControl == "true") {
      this.IsTwentyFour = true;
    } else {
      this.IsTwentyFour = false;
    }
    this.validateAllFormFields(this.CancelForm);
    if (this.CancelForm.valid) {
      this.indLoading = true;
      var notes = '';
      if (obj.NotesFormControl) {
        notes = obj.NotesFormControl;
      }

      var updObj = {
        "AbanId": this.AbanId,
        "StatusId": 9,
        "UserId": this.UserId,
        "Notes": notes,
        "IsTwentyFour": this.IsTwentyFour,

      };
      this.indLoading = true;
      this._dataService.post(Global.DLMS_API_URL + 'api/Aban/UpdateVehicleTimedStatus', updObj)
        .subscribe(response => {

          if (response.Id > 0) {
            this.SuccessMsg = "Vehicle Timed Successfully.";
            this.StatusId = 9;
          } else {
            this.ErrorMsg = "Vehicle Time could not be set. Please try again.";
          }

          this.indLoading = false;
          this.OnSave.emit(this.AbanId);


        },
          error => {
            this.indLoading = false;
            this.ErrorMsg = <any>error
          });
    }


  }
  close() {
    this.OnSave.emit(-3);
  }
  backtolist() {
    this.OnSave.emit(0);
  }
  Save(obj) {
    var citationobj;
    var citationlist = [];
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    let reasonid = null;
    if (obj.CloseReasonFormControl) {
      reasonid = obj.CloseReasonFormControl.ReasonId;
    }
    if (reasonid == 8) {
      this.ConvertVehicleTimed(obj);
    } else if (this.hasTowReasons) {
      this.ConvertDispatch(obj);
    } else {
      if (confirm("Do you want to close this Record# " + this.RecordId + " ?")) {
        if (obj.CloseReasonFormControl) {
          reasonid = obj.CloseReasonFormControl.ReasonId;
          if (reasonid == 4) {
            citationobj = this.citations.CitationForm.value;
            if (citationobj.Citations.length > 0) {
              for (var i = 0; i < citationobj.Citations.length; i++) {
                var citation = citationobj.Citations[i];

                if (citation.CitationFormControl == null || citation.CitationFormControl == undefined || citation.CitationFormControl.trim() == "") {
                } else {
                  citationlist.push({ "CitationXrefId": -1, "Citation": citation.CitationFormControl })
                }
              }
              if (citationlist.length == 0) {
                this.ErrorMsg = "Please enter atleast 1 Citation.";
                return;
              }
            } else {
              this.ErrorMsg = "Please enter atleast 1 Citation.";
              return;
            }
          }

        }
        if (reasonid == null && obj.NotesFormControl == undefined) {
          this.ErrorMsg = "Please select a reason.";
          return;
        }
        this.indLoading = true;
        var notes = '';
        if (obj.NotesFormControl) {
          notes = obj.NotesFormControl;
        }
        var cancelobj = {
          "ReasonId": reasonid,
          "Notes": notes,
          "AbanId": this.AbanId,
          "UserId": this.UserId,
          "Citations": citationlist
        }

        this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Cancel', cancelobj)
          .subscribe(response => {
            if (response.Id > 0) {
              this.SuccessMsg = "Record Closed Successfully.";
              this.StatusId = 4;
            } else {
              this.ErrorMsg = "Record Closing Failed. Please try again.";
            }
            this.indLoading = false;
            this.OnSave.emit(this.AbanId);
          },
            error => {
              this.indLoading = false;
              this.ErrorMsg = <any>error
            });
      }
    }
  }

}
