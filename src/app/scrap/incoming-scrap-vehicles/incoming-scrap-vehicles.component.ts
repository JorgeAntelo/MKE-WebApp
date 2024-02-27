import { DatePipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { DataService } from 'src/app/core/services/data.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { Global } from 'src/app/shared/global';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'app-incoming-scrap-vehicles',
  templateUrl: './incoming-scrap-vehicles.component.html',
  styleUrls: ['./incoming-scrap-vehicles.component.css']
})
export class IncomingScrapVehiclesComponent implements OnInit {
  @ViewChild('templateAddVehicle') templateAddVehicleRef: TemplateRef<any>;
  public modalAddVehicleRef: BsModalRef;
  @ViewChild('templateConfirm')
  public TemplateConfirmRef: TemplateRef<any>;
  public modalConfirmRef: BsModalRef;
  @ViewChild('templateMoveAuctionDate')
  public TemplateMoveAuctionDateRef: TemplateRef<any>;
  public modalMoveAuctionDateRef: BsModalRef;
  @ViewChild('templateAddVehicleConfirm')
  public templateAddVehicleConfirmRef: TemplateRef<any>;
  public modalAddVehicleConfirmRef: BsModalRef;

  @ViewChild('templateAuditScrap') templateAuditScrapRef: TemplateRef<any>;
  public modalAuditScrapRef: BsModalRef;

  @ViewChild('templateVerify')
  public templateVerifyRef: TemplateRef<any>;
  public modalVerifyRef: BsModalRef;

  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: number;
  // scrapService: ScrapService;
  /*  TowRowsList: any;
   TowColumnsList: any; */
  IncomingScrapList: any[];
  IncomingScrapListArray: FormArray;
  SearchForm: FormGroup;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  CurrentDate = new Date();
  MakeList: any;
  TowConfig: any;
  IsInterval: any;
  ModalLoading = false;
  ModalErrorMsg: any;
  ModalSuccessMsg: any;
  AddVehicleModalForm: FormGroup;

  SelectedTowingId: any;
  RecordIdList: any[];
  query: any;
  RoleId: number;
  ModalName: any;
  ConfirmMessage: any;
  DeleteIndex: number;
  ModalType: any;

  MoveAuctionForm: FormGroup;
  VerifyNotesForm: FormGroup;
  myMoveFilter: any;
  AuctionDates: any[];
  AuctionDatesId: number;
  AddErrorMsg: any;
  minDate = new Date();

  AuditScrapModalForm: FormGroup;
  AuditScrapList: any[];
  AuditTotalPageCount: any[];
  AuditTotalPagenum: any;
  AuditTotalRecord: any;
  AuditPagenumber: any;
  AuditPageId: any;
  verifyRefTowingId: number;

  PermissionPageId: number; 
  ButtonPermissionList = [];
  RemoveFromScrapButton: boolean;
  RecordIdHyperlink:boolean;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private excelService: ExcelService,
    private modalService: BsModalService,
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.PermissionPageId = params.PageId;
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
    this.LoadButtonPermission(this.PermissionPageId, this.RoleId);
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.Pagenumber = 1;
    this.AuditPagenumber = 1;
    this.LoadMake();
    this.LoadTowList(this.SearchForm);

  }

  createForm() {
    this.SearchForm = new FormGroup({
      RecordIdFormControl: new FormControl(''),
      PlateFormControl: new FormControl(''),
      VinFormControl: new FormControl(''),
      MakeFormControl: new FormControl(''),
      FromDateFormControl: new FormControl(''),
      ToDateFormControl: new FormControl(''),
      ReleaseDateFormControl: new FormControl(''),
      VehicleListArray: this.formBuilder.array([])
    });


    this.AuditScrapModalForm = new FormGroup({
      AuditRecordIdFormControl: new FormControl(''),
      AuditfromdateFormControl: new FormControl(''),
      AudittodateFormControl: new FormControl('')
    });



  }

  initVehicleItem() {
    return this.formBuilder.group({
      TowingId: new FormControl(''),
      IsSelectedFormControl: new FormControl('')
    });
  }

  get formData() {
    return <FormArray>this.SearchForm.get('VehicleListArray');
  }
  
  LoadButtonPermission(PageId, RoleId): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(BPLists => {
        if (BPLists != null) {
          this.ButtonPermissionList = BPLists;
          for (var i = 0; i < this.ButtonPermissionList.length; i++) {
            if (this.ButtonPermissionList[i]['Control_Name'] == 'btnRemoveFromScrap') {
              this.RemoveFromScrapButton = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } 
            if (this.ButtonPermissionList[i]['Control_Name'] == 'lnkVehicleInfo') {
              this.RecordIdHyperlink = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } 
          }
        }
      },
        error => { this.ErrorMsg = <any>error });
  }
  private VehicleInfo(index: number) {
    let TowingId: number = this.IncomingScrapList[index]['TowingId'];
    window.open(Global.PoliceURL + 'Officer/Tabs/VehicleInfoTab.aspx?TID=' + TowingId + '&FromList=SearchTow.aspx', '_blank');
  }
  LoadMake(): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/Make')
      .subscribe(Makes => {
        this.MakeList = Makes;
      },
      error => {
        this.ErrorMsg = <any>error
      });

  }
  Search(obj) {
    if (this.SearchForm.valid) {
      this.LoadTowList(obj);
    }
  }
  LoadTowList(obj): void {
    this.IncomingScrapList = [];
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.TotalPageCount = [];
    this.TotalPagenum = '';

    let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
    let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
    let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
    let Make = this.SearchForm.controls["MakeFormControl"].value;
    let FromDate = this.SearchForm.controls["FromDateFormControl"].value ? (this.SearchForm.controls["FromDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["FromDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["FromDateFormControl"].value.getFullYear() : '';
    let ToDate = this.SearchForm.controls["ToDateFormControl"].value ? (this.SearchForm.controls["ToDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ToDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ToDateFormControl"].value.getFullYear() : '';

    let ReleaseDate = this.SearchForm.controls["ReleaseDateFormControl"].value ? moment(new Date(this.SearchForm.controls["ReleaseDateFormControl"].value)).format('MM-DD-YYYY') : '';
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapReleasedList?PageNum=' + this.Pagenumber +
      "&PageSize=" + this.PageSize +
      '&RecordId=' + RecordId +
      '&Plate=' + Plate +
      '&Vin=' + Vin +
      '&Make=' + Make +
      '&FromDate=' + FromDate +
      '&ToDate=' + ToDate +
      '&ReleasedDate=' + ReleaseDate +
      '&DeviceType=W')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          this.IncomingScrapList = items;
          this.sortformarray();
          this.TotalPagenum = this.IncomingScrapList[0]["TotalPages"];
          this.TotalPageCount = [];
          for (var i = 1; i <= this.TotalPagenum; i++) {
            this.TotalPageCount.push({ Id: i, Description: i });
          }
          if (this.Pagenumber == 1) {
            this.PageId = 1;
          }
          this.TotalRecord = "Total Records Found: " + this.IncomingScrapList[0]["TotalRecords"];
        }
        else {
          this.IncomingScrapList = [];

        }
      },
      error => {
        this.indLoading = false;
        this.ErrorMsg = <any>error
      });
  }
  Clear() {
    this.SearchForm.reset();
    this.LoadTowList(this.SearchForm);
  }
  onPageChange(PageNumber: any) {
    this.Pagenumber = PageNumber;
    this.PageId = PageNumber;
    this.LoadTowList(this.SearchForm.value);
  }

  first() {
    if (this.PageId === 'undefined' || this.PageId > 1) {
      this.Pagenumber = 1;
      this.PageId = this.Pagenumber;
      this.LoadTowList(this.SearchForm.value);
    }
  }

  previous() {
    if (this.PageId != 'undefined') {
      if (this.PageId > 1) {
        this.Pagenumber = this.PageId - 1;
        this.PageId = this.Pagenumber;
        this.LoadTowList(this.SearchForm.value);
      }
    }
  }

  next() {
    if (this.PageId != 'undefined') {
      if (this.PageId < this.TotalPagenum) {
        this.Pagenumber = this.PageId + 1;
        this.PageId = this.Pagenumber;
        this.LoadTowList(this.SearchForm.value);
      }
    }
  }

  last() {
    if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
      this.Pagenumber = this.TotalPagenum;
      this.PageId = this.Pagenumber;
      this.LoadTowList(this.SearchForm.value);
    }

  }

  download() {
    let Itemexport = [];

    for (let i = 0; i < this.IncomingScrapList.length; i++) {
      Itemexport.push({
        'RecordId': this.IncomingScrapList[i]['RecordId'],
        'Plate': this.IncomingScrapList[i]['Plate'],
        'Vin': this.IncomingScrapList[i]['VIN'],
        'Year': this.IncomingScrapList[i]['VehYear'],
        'Make': this.IncomingScrapList[i]['Make'],
        'Model': this.IncomingScrapList[i]['Model'],        
        /* 'Lot-Space': this.IncomingScrapList[i]['RowSpace'], */       
        /* 'Vehicle Received Date': this.datePipe.transform(this.IncomingScrapList[i]['VehicleReceivedDate'], 'MMM d, y, h:mm a') + "\t", */
        'Scrap Release Date': this.datePipe.transform(this.IncomingScrapList[i]['ScrapReleaseDate'], 'MM/dd/yyyy h:mm a') + "\t",
        'Released By': this.IncomingScrapList[i]['ScrapReleasedBy'],
        'Scrap Company': this.IncomingScrapList[i]['ScrapCompanyName'],
        'Rate($)': this.currencyPipe.transform(this.IncomingScrapList[i]['Rate'], 'USD').replace('$', '')
      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'Incoming Scrap Vehicles');
    this.indLoading = false;
  }

  private ScrapVerify(template: TemplateRef<any>, TowingId: number) {
    this.SuccessMsg = this.ErrorMsg = "";
    this.ClearMsg();
    this.VerifyNotesForm.reset();
    this.modalVerifyRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
    this.verifyRefTowingId = TowingId;
  }

  ClearMsg() {
    this.SuccessMsg = this.ErrorMsg = this.ModalErrorMsg = this.ModalSuccessMsg = "";
  }


  isnull(obj, replacevalue: any): any {
    return obj ? obj : replacevalue
  }
  updateCheck(obj) {
    for (var i = 0; i < this.IncomingScrapList.length; i++) {
      if (obj.checked === true) {
        this.SearchForm.controls.VehicleListArray['controls'][i].controls['IsSelectedFormControl']
          .setValue(true);
      }
      else {
        this.SearchForm.controls.VehicleListArray['controls'][i].controls['IsSelectedFormControl']
          .setValue(false);
      }
    }
  }
  OpenConfirm(template: TemplateRef<any>, index: number,type: string) {
    this.ClearMsg();
    

    if(type== 'r')
    {
      if (index == -1) {
        let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
        if (selectedArray.length == 0) {
          this.ErrorMsg = "Please select a record from grid";
          return;
        }
      }
    this.ModalName = 'Confirm Receive';
    this.ConfirmMessage = 'Are you sure want to proceed?';
    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);
    this.DeleteIndex = index;
    this.ModalType = 'receive';
  }
  else{
    this.ModalName = 'Confirm Remove';
    this.ConfirmMessage = 'Are you sure want to remove this vehicle from list?';
    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);
    this.DeleteIndex = index;
    this.ModalType = 'delete';
  }
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    document.getElementById("ModalRcvConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }
  OkConfirm(index: number) {
    this.ClearMsg();
    switch (this.ModalType) {
      case 'receive':
        this.ReceiveScrap(index);
        this.modalConfirmRef.hide();
        break;
        case 'delete':
        this.RemoveScrap(index);
        this.modalConfirmRef.hide();
        break;
      default:
        this.CancelConfirm();
        break;
    }
  }

  CancelConfirm() {
    this.ClearMsg();
    this.modalConfirmRef.hide();
  }
  private ReceiveScrap(index) {
    this.ClearMsg();
    let TowingId = '';
    
    if (index != -1) {
      TowingId = <string>index;
    }

    let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
    let ObjA = {
      UserId: this.UserId,
      TowingIds: index != -1 ? TowingId : Array.prototype.map.call(selectedArray, item => item.TowingId).toString()
    };

    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/ReceiveScrap', ObjA)
      .subscribe(result => {
        if (result.Id > 0) {
          this.LoadTowList(this.SearchForm);
          this.SuccessMsg = result.result;
        } else {
          this.ErrorMsg = result.result;
        }
      }, error => {
        this.ErrorMsg = <any>error;
      });
  }
  private RemoveScrap(tid) {
    this.ClearMsg();
    let TowingId = tid;
  
    let ObjA = {     
      TowingId:TowingId,
      UserId: this.UserId,
      RemoveReason:'Removed from Incoming Scrap Vehicles'
    };

    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/RemoveFromIncomingScrapList', ObjA)
      .subscribe(result => {
        if (result.Id == 1) {
          this.LoadTowList(this.SearchForm);
          this.SuccessMsg = result.result;
        } else {
          this.ErrorMsg = result.result;
        }
      }, error => {
        this.ErrorMsg = <any>error;
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
  OpenAuditScrap(template: TemplateRef<any>) {
    this.AuditScrapList = [];
    this.ClearMsg();
    this.AuditScrapModalForm.reset();
    this.LoadAuditScrapList(this.AuditScrapModalForm.value);
    this.modalAuditScrapRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  CloseAuditScrapTemplate() {
    this.ClearMsg();
    this.modalAuditScrapRef.hide();
  }
  ClearAuditScrap(obj) {
    this.ClearMsg();
    this.AuditScrapModalForm.reset();
    this.AuditScrap(obj);
  }
  AuditScrap(obj: any) {
    this.AuditPagenumber = 1;
    this.LoadAuditScrapList(obj);
  }
  LoadAuditScrapList(obj): void {
    this.AuditScrapList = [];
    this.ClearMsg();
    this.AuditTotalPageCount = [];
    this.AuditTotalPagenum = '';
    let RecordId = this.AuditScrapModalForm.controls["AuditRecordIdFormControl"].value ? this.AuditScrapModalForm.controls["AuditRecordIdFormControl"].value : '';
    let FromDate = this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value ? (this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getMonth() + 1) + '-' + this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getDate() + '-' + this.AuditScrapModalForm.controls["AuditfromdateFormControl"].value.getFullYear() : '';
    let ToDate = this.AuditScrapModalForm.controls["AudittodateFormControl"].value ? (this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getMonth() + 1) + '-' + this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getDate() + '-' + this.AuditScrapModalForm.controls["AudittodateFormControl"].value.getFullYear() : '';
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapReleasedList?PageNum=' + this.AuditPagenumber +
      "&PageSize=" + this.PageSize +
      '&RecordId=' + RecordId +
      '&FromDate=' + FromDate +
      '&ToDate=' + ToDate +
      '&DeviceType=W')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null && items.length > 0) {
          this.AuditScrapList = items;
          this.AuditTotalPagenum = this.AuditScrapList[0]["TotalPages"];
          this.AuditTotalPageCount = [];
          for (var i = 1; i <= this.AuditTotalPagenum; i++) {
            this.AuditTotalPageCount.push({ Id: i, Description: i });
          }
          if (this.AuditPagenumber == 1) {
            this.AuditPageId = 1;
          }
          this.AuditTotalRecord = "Total Records Found: " + this.AuditScrapList[0]["TotalRecords"];
        }
        else {
          this.AuditScrapList = [];
        }
      },
      error => {
        this.indLoading = false;
        this.ModalErrorMsg = <any>error
      });
  }

  onPageChangeAudit(PageNumber: any) {
    this.AuditPagenumber = PageNumber;
    this.AuditPageId = PageNumber;
    this.LoadAuditScrapList(this.AuditScrapModalForm.value);
  }

  Auditfirst() {
    if (this.AuditPageId === 'undefined' || this.AuditPageId > 1) {
      this.AuditPagenumber = 1;
      this.AuditPageId = this.AuditPagenumber;
      this.LoadAuditScrapList(this.AuditScrapModalForm.value);
    }
  }

  Auditprevious() {
    if (this.AuditPageId != 'undefined') {
      if (this.AuditPageId > 1) {
        this.AuditPagenumber = this.AuditPageId - 1;
        this.AuditPageId = this.AuditPagenumber;
        this.LoadAuditScrapList(this.AuditScrapModalForm.value);
      }
    }
  }

  Auditnext() {
    if (this.AuditPageId != 'undefined') {
      if (this.AuditPageId < this.AuditTotalPagenum) {
        this.AuditPagenumber = this.AuditPageId + 1;
        this.AuditPageId = this.AuditPagenumber;
        this.LoadAuditScrapList(this.AuditScrapModalForm.value);
      }
    }
  }

  Auditlast() {
    if (this.AuditPageId === 'undefined' || this.AuditPageId < this.AuditTotalPagenum) {
      this.AuditPagenumber = this.AuditTotalPagenum;
      this.AuditPageId = this.AuditPagenumber;
      this.LoadAuditScrapList(this.AuditScrapModalForm.value);
    }

  }
  setClass(tl) {
    if (tl.IsHealthTow == true) {
      return 'tag-bgpink';
    }
    else {
      return '';
    }
  }
  sortListData(sort: Sort) {
    const data = this.IncomingScrapList.slice();
    if (!sort.active || sort.direction === '') {
        this.IncomingScrapList = data;
        return;
    }
  
    this.IncomingScrapList = data.sort((a, b) => {
        const isAsc = sort.direction === 'asc';
        switch (sort.active) {
  
            /* case 'recordid': return compare(parseInt(a.TCN.replace(/[^\d]/g, '')), parseInt(b.TCN.replace(/[^\d]/g, '')), isAsc); */
            case 'recordid':  return compare(a.RecordId,b.RecordId, isAsc);
            case 'issueno':  return compare(a.IssueNo,b.IssueNo, isAsc);
            case 'space': return compare(a.RowSpace,b.RowSpace, isAsc);
            case 'plate': return compare(a.Plate,b.Plate, isAsc);
            case 'vin': return compare(a.VIN,b.VIN, isAsc);
            case 'year': return compare(a.VehYear,b.VehYear, isAsc);
            case 'make': return compare(a.Make,b.Make, isAsc);
            case 'model': return compare(a.Model,b.Model, isAsc);           
            case 'releasedate': return compare(a.ScrapReleaseDate,b.ScrapReleaseDate, isAsc);
            case 'releasedby': return compare(a.ScrapReleasedBy,b.ScrapReleasedBy , isAsc);
            case 'scrapcompany': return compare(a.ScrapCompanyName,b.ScrapCompanyName, isAsc);
            case 'rate': return compare(a.Rate,b.Rate, isAsc);
  
            default: return 0;
        }
    });
    this.sortformarray();
  }
  sortformarray() {
    const control = <FormArray>this.SearchForm.controls['VehicleListArray'];
    control.controls = [];
    for (var i = 0; i < this.IncomingScrapList.length; i++) {
      control.push(this.initVehicleItem());
      this.SearchForm.controls.VehicleListArray['controls'][i].controls['IsSelectedFormControl']
        .setValue(false, { onlySelf: true });
      this.SearchForm.controls.VehicleListArray['controls'][i].controls['TowingId']
        .setValue(this.IncomingScrapList[i]["TowingId"], { onlySelf: true });
    }
  }
}
function compare(a: number | string, b: number | string, isAsc: boolean) {
return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

class ScrapAuthorizeModel {
  TowingId: number;
  ScrapAuthorizationNotes: string;
  UserId: number;
}
