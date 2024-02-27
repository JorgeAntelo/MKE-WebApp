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
  selector: 'app-eventinfo',
  templateUrl: './eventinfo.component.html',
  styleUrls: ['./eventinfo.component.css']
})
export class EventinfoComponent implements OnInit {
  @Input() AbanId: number;
  @Input() ShowFiltered: boolean=false;
  indLoading: boolean = false;
  LoaderImage: any;
  EventList = [];
  constructor(private _dataService: DataService,
    private router: Router, ) { }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.LoadEventList(this.AbanId);
  }
  LoadEventList(abanid): void {
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/SelectViolationEvents?AbanId=' + abanid)
      .subscribe(items => {
        this.EventList = items;
        if(this.ShowFiltered){
          let filterby="Peo Assigned";
          this.EventList=items.filter(s => s.Event.toLowerCase().indexOf(filterby.toLowerCase()) === 0)
        }
       // console.log(this.EventList);
        this.indLoading = false;
      },
        error => {
          this.indLoading = false;
        });

  }

}
