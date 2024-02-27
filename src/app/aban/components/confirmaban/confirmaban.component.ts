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
  selector: 'app-confirmaban',
  templateUrl: './confirmaban.component.html',
  styleUrls: ['./confirmaban.component.css']
})
export class ConfirmabanComponent implements OnInit {
  @Input() RecordId: number;
  @Input() AbanId: number;
  @Input() UserId: number;
  @Input() ControlID: any;
  @Input() Count: any;
  @Input() StatusId: number;

  @Output() OnSave = new EventEmitter();

  ErrorMsg: any;
  SuccessMsg: any;
  indLoading: boolean = false;
  LoaderImage: any;
  ConfirmForm: FormGroup;
  constructor(private _dataService: DataService,
    private router: Router,) { }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
  
  }
  createForm() {
    this.ConfirmForm = new FormGroup({
      DateFormControl: new FormControl(''),
      TimeFormControl: new FormControl(''),
      NotesFormControl:new FormControl(''),
    });
    var objdate = new Date();
    var time = objdate.toTimeString().slice(0, 5);
    (<FormControl>this.ConfirmForm.controls['DateFormControl']).setValue(objdate, {});
    (this.ConfirmForm.controls['DateFormControl']).updateValueAndValidity();
    (<FormControl>this.ConfirmForm.controls['TimeFormControl']).setValue(time, {});
    (this.ConfirmForm.controls['TimeFormControl']).updateValueAndValidity();
  }
  close(){
    this.OnSave.emit(-2);
  }
  backtolist(){
    this.OnSave.emit(0);
  }
  Save(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    
    var objDate = new Date(obj.DateFormControl);
    var date=(objDate.getMonth()+1)+'/'+objDate.getDate()+'/'+objDate.getFullYear();
    
    this.indLoading = true;
    var abanobj =
    {
      "AbanId": this.AbanId,
      "UserId": this.UserId,           
      "Time": obj.TimeFormControl,
      "Date": date,
      "Notes": obj.NotesFormControl,
    }
    this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Confirm', abanobj)
    .subscribe(response => {
      //console.log(response);
      if (response.Id > 0) {
        this.SuccessMsg = "Dispatch Acknowledged Successfully.";
       

      } else {
        this.ErrorMsg = "Dispatch Acknowledgement Failed. Please try again.";
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
