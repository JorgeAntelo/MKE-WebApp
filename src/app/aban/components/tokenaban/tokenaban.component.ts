import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { TimepickerModule } from 'ngx-bootstrap';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
import { LocalStorageService } from 'angular-2-local-storage';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
  selector: 'app-tokenaban',
  templateUrl: './tokenaban.component.html',
  styleUrls: ['./tokenaban.component.css']
})
export class TokenabanComponent implements OnInit {
  ErrorMsg: any;
  SuccessMsg: any;
  AbanList = [];
  indLoading: boolean;
  LoaderImage: any;
  IsCitizenRequest: boolean = false;
  UserId: Number;
  IsDispatchEligible:boolean=false;
  IsAdmin:boolean=false;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,) { 
      activatedRoute.params.subscribe(val => {
        //console.log(val);
        let AbanId = val.Id;
        let that = this;
  
      });
      this.activatedRoute.queryParams.subscribe(params => {

        let AbanId = params.Id;
  
        let LoggeduserId = params.UserId;
        let iscitizen = params.Ic;
        let token = params.Token;
        if (iscitizen == 1) {
          this.IsCitizenRequest = true;
          
        }
        if (LoggeduserId) {
          this.UserId = Number(LoggeduserId);
          this.IsAdmin=Boolean(params.Ia);
          // console.log(this.UserId);
        }
        
        if (token != '0' ) {
          this._dataService.get(Global.DLMS_API_URL + 'api/Aban/getAbanIdfromToken?token=' + token)
            .subscribe(id => {
              
              this.LoadAbanDetails(id);
            }, error => {
              this.indLoading = false;
              this.ErrorMsg = <any>error
            });
        } else {
          if (AbanId) {
            
            this.LoadAbanDetails(AbanId);
          }
        }
  
  
      });
    }
    ngAfterViewInit() {
      this.LoaderImage = Global.FullImagePath;
      // console.log("call ngAfterViewInit");
    }
  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
  }
  LoadAbanDetails(AbanId) {
    if (AbanId == 0 || AbanId == null) {
      AbanId = -1;
    }

    var searchobj = {
      "id": AbanId,
      "createdby": null,
      "statusid": null,
      "frmDate": '',
      "toDate": '',
      "voilationReasonid": null,
      "textlocationid": null,
      "LicNo": '',
      "carvin_id": '',
      "reqBy": '',
      "complaintno": '',
      "offset": 1,
      "counter": 1,
      "IsDispatchEligible": null,
      "MakeId": 0,
      "ModelId": 0,
      "Location":'',
      "StyleId":0,
      "ColorId":0,
      "LastName":""
    };

    this.indLoading = true;
    this._dataService.post(Global.DLMS_API_URL + 'api/Aban/Search', searchobj)
      .subscribe(items => {
        // console.log(items);
        if (items.length == 1) {
          this.AbanList= items;
         
        } else {
          this.ErrorMsg = "No Record Found"
        }
        this.indLoading = false;
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });

  }
}
