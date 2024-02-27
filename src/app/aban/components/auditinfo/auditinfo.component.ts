import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef, Inject, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-auditinfo',
  templateUrl: './auditinfo.component.html',
  styleUrls: ['./auditinfo.component.css']
})
export class AuditinfoComponent implements OnInit {
  @Input() AbanId: number;
  indLoading: boolean = false;
  LoaderImage: any;
  AuditList = [];

  constructor(private _dataService: DataService,
    private router: Router,) { 
      this.LoaderImage = Global.FullImagePath;
    
    }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.LoadAudit(this.AbanId);
  }
  LoadAudit(abanid): void {
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Aban/SelectViolationAudit?AbanId=' + abanid)
      .subscribe(items => {
        this.AuditList = [];//items;
        console.log(items);
        let addTrantype=[];
        
        if(items!=null && items.length>0){
          let editTrantype=[];
          let lineitem=0;

          items.forEach(audit => {
            let AuditListProps = Object.keys(audit);
            let itemarray=[];
            let item={};
            AuditListProps.forEach(prop => {
              if(audit[prop]!=null && (audit[prop]).toString().trim()!=""){
                if(prop!="AuditId" && prop!="Aban_Id" ){
                 
                  if(prop!="TranType" && prop!="TranDate" && prop!="TranUser"){
                    
                    itemarray.push({"prop":prop,"value":audit[prop]})
                  }else{
                    item[prop]=audit[prop];

                  }
                }
              }
            });
            item["ModifiedCols"]=itemarray;
            editTrantype.push(item);
            lineitem++;
          });
          this.AuditList = editTrantype;
        }
        console.log( this.AuditList);
        this.indLoading = false;
      },
        error => {
          this.indLoading = false;
        });

  }
}
