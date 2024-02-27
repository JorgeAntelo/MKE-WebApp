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
  selector: 'app-scrapreleases',
  templateUrl: './scrapreleases.component.html',
  styleUrls: ['./scrapreleases.component.css']
})
export class ScrapreleasesComponent implements OnInit {

  @ViewChild('templateConfirm')
  public TemplateConfirmRef: TemplateRef<any>;
  public modalConfirmRef: BsModalRef;

  @ViewChild('templateVerify')
  public templateVerifyRef: TemplateRef<any>;
  public modalVerifyRef: BsModalRef;

  @ViewChild('templateSaveScrapRate')
  public TemplateSaveScrapRateRef: TemplateRef<any>;
  public modalSaveScrapRateRef: BsModalRef;

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

  ScrapReleasesList: any[];
  ScrapReleasesListArray: FormArray;
  SearchForm: FormGroup;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;

  TowConfig: any;
  IsInterval: any;
  ModalLoading = false;
  ModalErrorMsg: any;
  ModalSuccessMsg: any;


  SelectedTowingId: any;
  RecordIdList: any[];
  query: any;
  RoleId: number;
  ModalName: any;
  ConfirmMessage: any;
  DeleteIndex: number;
  ModalType: any;

  SaveScrapRateModalForm: FormGroup;
  ButtonPermissionList = [];
  IsSaveRate: boolean;
  IsSaveGrid: boolean;
  IsRemoveGrid: boolean;
  IsTxtWeight: boolean;
  IsTxtRate: boolean;
  IsRelease: boolean;
  IsReleaseGrid: boolean;
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
    this.Pagenumber = 1;
    this.LoadPermission(this.PageId, this.RoleId);
    this.LoadTowList(this.SearchForm);

  }

  createForm() {
    this.SearchForm = new FormGroup({
      RecordIdFormControl: new FormControl(''),
      VehicleListArray: this.formBuilder.array([])
    });
    this.SaveScrapRateModalForm = new FormGroup({
      BulkScrapRateFormControl: new FormControl('', [Validators.required, Validators.pattern(Global.DECIMAL_REGEX)])
    });
  }

  initVehicleItem() {
    return this.formBuilder.group({
      TowingId: new FormControl(''),
      RecordId: new FormControl(''),
      IsSelectedFormControl: new FormControl(''),
      ScrapRateFormControl: new FormControl(''),
      WeightFormControl: new FormControl('')
    });
  }

  get formData() {
    return <FormArray>this.SearchForm.get('VehicleListArray');
  }

  Search(obj) {
    if (this.SearchForm.valid) {
      this.LoadTowList(obj);
    }
  }
  LoadPermission(PageId, RoleId): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.ButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.ButtonPermissionList.length; i++) {
            if (this.ButtonPermissionList[i]['Control_Name'] == 'btnSaveRate') {
              this.IsSaveRate = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'imgbtnSave') {
              this.IsSaveGrid = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'imgbtnRemoveFromScrap') {
              this.IsRemoveGrid = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'txtWeight') {
              this.IsTxtWeight = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'txtRate') {
              this.IsTxtRate = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'btnRelease') {
              this.IsRelease = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            } else if (this.ButtonPermissionList[i]['Control_Name'] == 'imgbtnReleaseIndividual') {
              this.IsReleaseGrid = Boolean(this.ButtonPermissionList[i]["view_hide"]);
            }
          }
        }

      },
      error => { this.ErrorMsg = <any>error });
  }
  LoadTowList(obj): void {
    this.ScrapReleasesList = [];
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.TotalPageCount = [];
    this.TotalPagenum = '';

    let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';

    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapAuthorizedList?PageNum=' + this.Pagenumber +
      "&PageSize=" + this.PageSize +
      '&SearchText=' + RecordId +
      '&DeviceType=W')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null && items.length > 0) {
          this.ScrapReleasesList = items;
          this.sortformarray();
          this.TotalPagenum = this.ScrapReleasesList[0]["TotalPages"];
          this.TotalPageCount = [];
          for (var i = 1; i <= this.TotalPagenum; i++) {
            this.TotalPageCount.push({ Id: i, Description: i });
          }
          if (this.Pagenumber == 1) {
            this.PageId = 1;
          }
          this.TotalRecord = "Total Records Found: " + this.ScrapReleasesList[0]["TotalRecords"];
        }
        else {
          this.ScrapReleasesList = [];

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
    let ScrapReleasesExportList: any[] = [];

    let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';

    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapAuthorizedList?PageNum=' + this.Pagenumber +
      '&PageSize=10000&SearchText=' + RecordId +
      '&DeviceType=W')
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          ScrapReleasesExportList = items;

        }
        else {
          ScrapReleasesExportList = [];

        }
        for (let i = 0; i < ScrapReleasesExportList.length; i++) {
          Itemexport.push({
            'RecordId': ScrapReleasesExportList[i]['Impound_Num'],
            'Issue #': ScrapReleasesExportList[i]['IssueNo'],
            'Space': ScrapReleasesExportList[i]['RowSpace'],
            'Plate': ScrapReleasesExportList[i]['License_PlateNum'],
            'VIN': ScrapReleasesExportList[i]['Vehicle_VinNum'],
            'Year': ScrapReleasesExportList[i]['Year_Of_Make'],
            'Make': ScrapReleasesExportList[i]['Make'],
            'Model': ScrapReleasesExportList[i]['ModelName'],
            'Authorized Date': this.datePipe.transform(ScrapReleasesExportList[i]['ScrapAuthorizedDate'], 'MM/dd/yyyy, h:mm a') + "\t",
            'Weight': ScrapReleasesExportList[i]['Weight'],
            'Rate($)': ScrapReleasesExportList[i]['Rate'] ? this.currencyPipe.transform(ScrapReleasesExportList[i]['Rate'], 'USD').replace('$', '') : ""
          });
        }
        this.excelService.exportAsExcelFile(Itemexport, 'Scrap Releases List');
        this.indLoading = false;
      },
      error => {
        this.indLoading = false;
        this.ErrorMsg = <any>error
      });

  }

  private ScrapVerify(template: TemplateRef<any>, TowingId: number) {
    this.SuccessMsg = this.ErrorMsg = "";
    this.ClearMsg();
    /* this.VerifyNotesForm.reset();
    this.modalVerifyRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));
    this.verifyRefTowingId = TowingId; */
  }

  ClearMsg() {
    this.SuccessMsg = this.ErrorMsg = this.ModalErrorMsg = this.ModalSuccessMsg = "";
  }


  isnull(obj, replacevalue: any): any {
    return obj ? obj : replacevalue
  }
  updateCheck(obj) {
    for (var i = 0; i < this.ScrapReleasesList.length; i++) {
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
  OpenConfirm(template: TemplateRef<any>, TowingId: number, index: number, type: string) {
    this.ClearMsg();
    if (TowingId == -1) {
      let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
      if (selectedArray.length == 0) {
        this.ErrorMsg = "Please select a record from grid";
        return;
      }
    }

    if (type == 'r') {
      if (TowingId == -1) {
        let res = this.checkEmptyFields();
        if (res == 0) {
          return;
        }
      }
      else {

        let rowItem = this.SearchForm.value.VehicleListArray[index];

        let scrapRate = Number(this.ScrapReleasesList[index]["Rate"]);
        let scrapWeight = Number(this.ScrapReleasesList[index]["Weight"]);
        let isEmptyRow: boolean = false;
        if ((isNaN(scrapRate) || scrapRate == 0) && (isNaN(scrapWeight) || scrapWeight == 0)) {
          this.ErrorMsg = "Scrap Rate, Weight are required to be updated for release";
          return;
        }

        if (isNaN(scrapRate) || scrapRate == 0) {
          this.ErrorMsg = "Scrap Rate is required to be updated for release";
          return;
        }

        if (isNaN(scrapWeight) || scrapWeight == 0) {
          this.ErrorMsg = "Weight is required to be updated for release";
          return;
        }
       
      }

      this.ModalName = 'Confirm Release';
      this.ConfirmMessage = 'Are you sure want to Scrap Release Selected Vehicle/Vehicles ?';
      this.ModalType = 'release';

    }
    else {
      this.ModalName = 'Confirm Delete';
      this.ConfirmMessage = 'Are you sure want to Remove Selected Vehicle from Scrap?';
      this.ModalType = 'delete';
    }

    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);
    this.DeleteIndex = TowingId;

    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    document.getElementById("ModalRcvConfirm").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }

  OkConfirm(TowingId: number) {
    this.ClearMsg();
    switch (this.ModalType) {
      case 'release':
        this.ReleaseScrap(TowingId);
        this.modalConfirmRef.hide();
        break;
      case 'delete':
        this.RemoveScrap(TowingId);
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

  private ReleaseScrap(TowingId) {
    this.ClearMsg();

    if (TowingId != -1) {
      TowingId = <string>TowingId;
    }

    let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
    // console.log(selectedArray);
    let ObjA = {
      UserId: this.UserId,
      TowingIds: TowingId != -1 ? TowingId : Array.prototype.map.call(selectedArray, item => item.TowingId).toString()
    };
    // console.log(ObjA);
    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/SaveScrapRelease', ObjA)
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

  private RemoveScrap(TowingId) {
    this.ClearMsg();

    let ObjA = {
      UserId: this.UserId,
      TowingId: TowingId,
      RemoveReason: ''
    };

    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/RemoveFromScrapReleaseList', ObjA)
      .subscribe(result => {
        if (result.Id > 0) {
          this.LoadTowList(this.SearchForm);
          this.SuccessMsg = this.SuccessMsg = "Vehicle Removed from Scrap Release List";
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

  integerOnly(event) {
    const e = <KeyboardEvent>event;
    if (e.key === 'Tab' || e.key === 'TAB') {
      return;
    }
    if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && e.ctrlKey === true)) {
      // let it happen, don't do anything
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  sortListData(sort: Sort) {
    const data = this.ScrapReleasesList.slice();
    if (!sort.active || sort.direction === '') {
      this.ScrapReleasesList = data;
      return;
    }

    this.ScrapReleasesList = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        /* case 'recordid': return compare(parseInt(a.TCN.replace(/[^\d]/g, '')), parseInt(b.TCN.replace(/[^\d]/g, '')), isAsc); */
        case 'recordid': return compare(a.Impound_Num, b.Impound_Num, isAsc);
        case 'issueno': return compare(a.IssueNo, b.IssueNo, isAsc);
        case 'space': return compare(a.RowSpace, b.RowSpace, isAsc);
        case 'plate': return compare(a.License_PlateNum, b.License_PlateNum, isAsc);
        case 'vin': return compare(a.Vehicle_VinNum, b.Vehicle_VinNum, isAsc);
        case 'year': return compare(a.Year_Of_Make, b.Year_Of_Make, isAsc);
        case 'make': return compare(a.Make, b.Make, isAsc);
        case 'model': return compare(a.ModelName, b.ModelName, isAsc);
        /* case 'receiveddate': return compare(a.VehicleReceivedDate,b.VehicleReceivedDate, isAsc); */
        case 'authorizedate': return compare(a.ScrapAuthorizedDate, b.ScrapAuthorizedDate, isAsc);
        case 'weight': return compare(a.Weight, b.Weight, isAsc);
        case 'rate': return compare(a.Rate, b.Rate, isAsc);
        default: return 0;
      }
    });
    this.sortformarray();
  }

  sortformarray() {
    const control = <FormArray>this.SearchForm.controls['VehicleListArray'];
    control.controls = [];
    for (var i = 0; i < this.ScrapReleasesList.length; i++) {
      control.push(this.initVehicleItem());
      this.SearchForm.controls.VehicleListArray['controls'][i].controls['IsSelectedFormControl']
        .setValue(false, { onlySelf: true });
      this.SearchForm.controls.VehicleListArray['controls'][i].controls['TowingId']
        .setValue(this.ScrapReleasesList[i]["Towing_Id"], { onlySelf: true });
      this.SearchForm.controls.VehicleListArray['controls'][i].controls['RecordId']
        .setValue(this.ScrapReleasesList[i]["Impound_Num"], { onlySelf: true });
      
      const scrapRateControl = this.SearchForm.get('VehicleListArray').get(`${i}.ScrapRateFormControl`);
      scrapRateControl.setValue(this.ScrapReleasesList[i]["Rate"], { onlySelf: true });
      if (!this.IsTxtRate) {
        scrapRateControl.disable();
      } else {
        scrapRateControl.enable(); 
      }

      const weightControl = this.SearchForm.get('VehicleListArray').get(`${i}.WeightFormControl`);
      weightControl.setValue(this.ScrapReleasesList[i]["Weight"], { onlySelf: true });
      if (!this.IsTxtWeight) {
        weightControl.disable();
      } else {
        weightControl.enable(); 
      }
    }
  }

  private VehicleInfo(index: number) {
    let TowingId: number = this.ScrapReleasesList[index]['Towing_Id'];
    window.open(Global.PoliceURL + 'Officer/Tabs/VehicleInfoTab.aspx?TID=' + TowingId + '&FromList=SearchTow.aspx', '_blank');
  }

  private SaveScrapRate(obj, index: number) {
    this.ClearMsg();
    let rowItem = obj.VehicleListArray[index];
    let TowingId = rowItem.TowingId;
    let ScrapRate = rowItem.ScrapRateFormControl;
    let Weight = rowItem.WeightFormControl;
    if (!ScrapRate && !Weight) {
      this.ErrorMsg = "Scrap Rate, Weight are required.";
      return;
    }

    if (!ScrapRate) {
      this.ErrorMsg = "Scrap Rate is required";
      return;
    }

    if (!Weight) {
      this.ErrorMsg = "Weight is required";
      return;
    }

    let ObjA = {
      TowingIds: TowingId,
      UserId: this.UserId,
      ScrapRate: ScrapRate,
      Weight: Weight
    };
    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/SaveTowingScrap', ObjA)
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

  private SaveBulkScrapRate(obj, option: boolean) {
    this.ClearMsg();

    if (!obj.BulkScrapRateFormControl) {
      this.ErrorMsg = 'Scrap Rate is Required';
      return;
    }
    let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
    // console.log(selectedArray);
    let ObjA = {
      TowingIds: Array.prototype.map.call(selectedArray, item => item.TowingId).toString(),
      UserId: this.UserId,
      ScrapRate: obj.BulkScrapRateFormControl
    };


    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/SaveTowingScrapRate', ObjA)
      .subscribe(result => {

        if (result.Id == 1) {
          if (option == true) {
            this.CloseSaveScrapRateTemplate();
            this.LoadTowList(this.SearchForm);
            this.SuccessMsg = result.result;
          }
          else {
            this.LoadTowList(this.SearchForm);
            this.SaveScrapRateModalForm.reset();
            this.SaveScrapRateModalForm.updateValueAndValidity();
            this.ModalSuccessMsg = result.result;
          }

        } else {
          this.ModalErrorMsg = result.result;
        }

      }, error => {


        this.ErrorMsg = <any>error;
      });

  }

  OpenSaveScrapRate(template: TemplateRef<any>) {
    this.ClearMsg();
    let selectedArray = this.formData.getRawValue().filter(item => item.IsSelectedFormControl == true);
    if (selectedArray.length == 0) {
      this.ErrorMsg = "Please select a record from grid";
      return;
    }

    this.SaveScrapRateModalForm.reset();
    this.modalSaveScrapRateRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray' }));

    document.getElementById("modalSaveScrapRate").parentElement.style.marginTop = window.localStorage.getItem('scroll_top') + 'px';
  }

  CloseSaveScrapRateTemplate() {
    this.ClearMsg();
    this.modalSaveScrapRateRef.hide();
  }
  setClass(tl) {
    if (tl.IsHealthTow == true) {
      return 'tag-bgpink';
    }
    else {
      return '';
    }
  }
  checkEmptyFields() {
    let emptyRows = [];
    this.ErrorMsg = null;
    const vehicleListArray = this.SearchForm.get('VehicleListArray') as FormArray;

    vehicleListArray.controls.forEach((vehicle, index) => {
      const vehicleControls = vehicle as FormGroup;

      // Check if the checkbox in the current row is selected
      const isSelectedControl = vehicleControls.get('IsSelectedFormControl');
      if (isSelectedControl && isSelectedControl.value) {

        let scrapRate = Number(this.ScrapReleasesList[index]["Rate"]);
        let scrapWeight = Number(this.ScrapReleasesList[index]["Weight"]);
        let isEmptyRow: boolean = false;
        if (isNaN(scrapRate) || scrapRate == 0 || isNaN(scrapWeight) || scrapWeight == 0) {
          isEmptyRow = true;
        }

        // const isEmptyRow = Object.keys(vehicleControls.controls).some(key => {
        //   const control = vehicleControls.get(key);
        //   return control.value === null || control.value === '';
        // });

        if (isEmptyRow) {
          let rowItem = this.SearchForm.value.VehicleListArray[index];
          emptyRows.push(`${rowItem.RecordId} `);
        }
      }
    });

    if (emptyRows.length > 0) {

      this.ErrorMsg = `The following Record Id(s) have empty Weight/Rate values: ${emptyRows.join(', ')}.`;
      return 0;
    } else {

      return 1;
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


