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
  selector: 'app-assign-aban',
  templateUrl: './assign-aban.component.html',
  styleUrls: ['./assign-aban.component.css']
})
export class AssignAbanComponent implements OnInit {
  @Input() RecordId: number;
  @Input() AbanId: number;
  @Input() UserId: number;
  @Input() ControlID: any;
  @Input() Count: any;
  @Input() StatusId: number;
  @Input() PeoUsers: any;

  @Output() OnSave = new EventEmitter();
  ErrorMsg: any;
  SuccessMsg: any;
  indLoading: boolean = false;
  LoaderImage: any;
  AssignmentForm: FormGroup;
  filteredOfficers: Observable<any[]>;

  constructor(private _dataService: DataService,
    private router: Router, ) { }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();

    this.filteredOfficers = this.AssignmentForm.controls['OfficerFormControl'].valueChanges
    .startWith('')
    .map(type => type && typeof type === 'object' ? type.Officer : type)
    .map(name => this.filterOfficers(name));
  }
  createForm() {
    this.AssignmentForm = new FormGroup({
      OfficerFormControl: new FormControl(''),
      NotesFormControl: new FormControl(''),

    });

  }

  Officerreset(): void {
    setTimeout(() => {
      (this.AssignmentForm.controls['OfficerFormControl']).setValue(null);
      
    }, 1);
  }

  filterOfficers(val) {
    const filterValue = val.toLowerCase();
    //return val ? this.PeoUsers.filter(s => s.Officer.toLowerCase().indexOf(val.toLowerCase()) === 0)
    return val ? this.PeoUsers.filter(s => s.Officer.toLowerCase().includes(filterValue))
      : this.PeoUsers;
  }

  OfficerdisplayFn(type): string {
    return type ? type.Officer : type;
  }


  close(){
    this.OnSave.emit(-1);
  }
  backtolist(){
    this.OnSave.emit(0);
  }
  checkValidInput(type){
    setTimeout(() => {
      var obj=this.AssignmentForm.value;
        if(type=="officer"){
          if (obj.OfficerFormControl.OfficerId === undefined) {
            this.Officerreset();
          }
        }
    }, 1000);
        
        
       }
  Save(obj) {
    this.SuccessMsg = "";
    this.ErrorMsg = "";
    let OfficerId = 0;
    if (obj.OfficerFormControl!==undefined && obj.OfficerFormControl!=null) {
      //OfficerId = obj.OfficerFormControl;
      OfficerId = obj.OfficerFormControl.OfficerId;
    }

    this.indLoading = true;
    var abanobj =
      {
        "AbanId": this.AbanId,
        "UserId": this.UserId,
        "OfficerId": OfficerId,
        "Notes": obj.NotesFormControl
      }

    this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Assign', abanobj)
      .subscribe(response => {
        //console.log(response);
        if (response.Id > 0) {
          let msg=response.result;
          if(msg.indexOf(":")>0){
          let notifmsg=msg.split(":")[1];
          if (notifmsg.indexOf("Notification")>0){
            msg=notifmsg;
          }else{
            msg="";
          }
          }else {
            msg="";
          }
          let type = "Complaint Dispatched";
          if (this.StatusId == 2) {
            type = "Reassigned";
          }
          if(msg!=""){
            this.SuccessMsg= "Record Saved Successfully, " + msg;
          }else{
            this.SuccessMsg = "Record " + type + " Successfully." ;
          }
          
        } else {
          let type = "Complaint Dispatch";
          if (this.StatusId == 2) {
            type = "Reassignment";
          }
          this.ErrorMsg = "Record " + type + " Failed. Please try again.";
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
