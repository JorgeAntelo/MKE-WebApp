import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Global } from 'src/app/shared/global';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { VehicleInfoService } from '../vehicle-info-services';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilService } from 'src/app/core/services/util.service';

@Component({
  selector: 'app-force-unlock-aproval-list',
  templateUrl: './force-unlock-aproval-list.component.html',
  styleUrls: ['./force-unlock-aproval-list.component.css']
})
export class ForceUnlockAprovalListComponent implements OnInit, OnDestroy {
  vehicleInfoService: VehicleInfoService;
  RejectionNotesForm: FormGroup;
  @ViewChild('templateVerify')
  public templateVerifyRef: TemplateRef<any>;
  public modalVerifyRef: BsModalRef;
  @ViewChild('templateConfirm')
  public TemplateConfirmRef: TemplateRef<any>;
  public modalConfirmRef: BsModalRef;
  indLoading = false;
  LoaderImage: any;
  IsInterval:any
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  TowRowsList: any;
  TowColumnsList: any;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  CurrentDate = new Date();
  MakeList: any;
  TowConfig: any;
  TowList: any;
  webUrl = Global.PoliceURL;
  subscription: Subscription;

  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  TowingId: number;
  Event: string;
  ErrorMsg1: any;
  constructor(private _dataService: DataService,
    private vehicleInfoServiceProvider: VehicleInfoService,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private utilService: UtilService) {
    this.vehicleInfoService = vehicleInfoServiceProvider;
    this.activatedRoute.queryParams.subscribe(params => {
      let LoggeduserId = params.uid;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
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

        // Receive message
        window.addEventListener('message', function (event) {
            this.localStorage.setItem('scroll_top', event.data);
        });
    }

  ngOnInit() {
    this.createForm();
    this.LoadTowList();
  }


  createForm() {
    this.RejectionNotesForm = new FormGroup({
      RejectionNotesFormControl: new FormControl('', [Validators.required])
    });

  }
  LoadTowList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";

    this.indLoading = true;
    this.subscription = this._dataService.get(Global.DLMS_API_URL + 'api/Notification/ForceUnlockApprovalList')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          this.TowList = items;
          this.TotalPagenum = this.TowList[0]["TotalPages"];
          this.TotalPageCount = [];
          for (var i = 1; i <= this.TotalPagenum; i++) {
            this.TotalPageCount.push({ Id: i, Description: i });
          }
          if (this.Pagenumber == 1) {
            this.PageId = 1;
          }
          this.TotalRecord = "Total Records Found: " + this.TowList[0]["TotalRecords"];
        }
        else {
          this.TowList = [];
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  RejectionConfimation(template: TemplateRef<any>, TowingId: number,Event: string) {
    this.SuccessMsg = this.ErrorMsg = "";
    this.RejectionNotesForm.reset();
    this.TowingId = TowingId;
    this.Event = Event;
    this.modalVerifyRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
    document.getElementById("modalVerifyRef").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  ApprovalConfimation(template: TemplateRef<any>, TowingId: number,Event: string){
    this.SuccessMsg = this.ErrorMsg = "";
    this.RejectionNotesForm.reset();
    this.TowingId = TowingId;
    this.Event = Event;
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    document.getElementById("CancelConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  SaveRejectionNotes(){
    if (this.RejectionNotesForm.invalid) {
      this.utilService.validateAllFormFields(this.RejectionNotesForm);
      return;
    }
    this.Action(this.TowingId, this.Event)
  }
  Action(TowingId, Event): void {
  
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    let ApproveModel: any = {
      TowingId: TowingId,
      UserId: this.UserId,
      Event: Event,
      Notes: this.RejectionNotesForm.getRawValue().RejectionNotesFormControl
    };
    this.indLoading = true;
    this.subscription = this._dataService.post(Global.DLMS_API_URL + 'api/Notification/ApproveRejectForceUnlock', ApproveModel)
      .subscribe(items => {
        this.indLoading = false;
        if (items.Id > 0) {
          this.LoadTowList();
          this.SuccessMsg = items.result;
          if(Event =='RejectedForceUnlock'){
            this.modalVerifyRef.hide();
          }
        } else {
          if(Event =='RejectedForceUnlock'){
            this.ErrorMsg1 = items.result;
          }else{
            
            this.ErrorMsg = items.result;
          }
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  OkConfirm() {
    this.modalConfirmRef.hide();
    this.Action(this.TowingId,this.Event);
  }

  CancelConfirm() {
    this.modalConfirmRef.hide();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
