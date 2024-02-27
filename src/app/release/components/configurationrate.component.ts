import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  Inject,
  ElementRef,
  NgZone,
  AfterViewInit
} from '@angular/core';
import { Http } from '@angular/http';
import { DataService } from '../../core/services/data.service';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../shared/global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationService } from '../../shared/components/navigation/navigation.service';
import { CurrencyPipe } from '@angular/common';
import { LocalStorageService } from 'angular-2-local-storage';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'configurationrate',
  templateUrl: './configurationrate.component.html'
})
export class ConfigurationRateComponent implements OnInit {
  @ViewChild('template')
  public templateRef: TemplateRef<any>;
  @ViewChild('templateHistory') modaltemplateHistoryRef: BsModalRef;
  @ViewChild('templateConfirm') modalConfirmRef: BsModalRef;
  @ViewChild('templateConfirm') modaltemplateAuditReleaseDetailsRef: BsModalRef;
  public modalRef: BsModalRef;
  ErrorMsg: any;
  SuccessMsg: any;
  DeleteErrorMsg: any;
  ConfirmMessage: any; UId: any;
  DeleteIndex: number;
  ModalName: any;
  ModalType: string;
  TowCompanyId: any;
  UserId: any;
  indLoading = false;
  indLoadingModal = false;
  HasRecords = false;
  IsTaxable = false;
  IsVariable = false;
  FeeName: string;

  ConfigurationRatePageSize: number;
  ConfigurationRatePageId: any;
  ConfigurationRatepagenumber: any;
  ConfigurationRatetotalpagenum: any;
  ConfigurationRateTotalRecord: any;
  ChargeType: any;
  cDateId: any;

  public ConfigurationRatetotalPageCount: any[];
  ConfigurationRateList = [];
  JurisdictionList = [];
  FeeHistoryRateList = [];

  ConfigurationRateSearchForm: FormGroup;
  ConfigurationRateDetailsForm: FormGroup;
  // HistoryForm: FormGroup;
  minDate: Date;
  CurrentDate: Date;

  private ConfigurationRateModelDetail: ConfigurationRateModel = new ConfigurationRateModel();
  saveMode = false;
  VehicleTypes: any[];
  EnterpriseId: any;
  AuditRatesDetailsList: any = [];
  private formSubmitAttempt: boolean;
  IsStorageFee: boolean;
  IsComapanyFee: boolean;
  ChargeTypeList = [];
  JurisdictionNone: Object = { JurisdictionId: '0', Name: 'None', TaxRate: '' };
  public config = { animated: true, keyboard: true, backdrop: true, ignoreBackdropClick: false };
  showIndex: number;
  DisplayInsideConfig: boolean = false;
  constructor(
    private _dataService: DataService,
    public nav: NavigationService,
    private localStorageService: LocalStorageService,
    private modalService: BsModalService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    if (this.localStorageService.get('EnterpriseId') != null) {
      this.EnterpriseId = this.localStorageService.get('EnterpriseId');
    }
    this.activatedRoute.queryParams.subscribe(params => {
      this.UId = params.uid;
    });


  }

  private createForm() {
    this.ConfigurationRateSearchForm = new FormGroup({
      ConfigurationRateSearchControl: new FormControl(),
      FromDateFormControl: new FormControl(''),
      ToDateFormControl: new FormControl(''),
    });
    this.ConfigurationRateDetailsForm = new FormGroup({
      ChargeTypeFormControl: new FormControl('', [Validators.required]),
      //  JurisdictionFormControl: new FormControl('', []),
      IsEditableFormControl: new FormControl('', []),
      IsVariableFormControl: new FormControl('', []),
      IsTaxableFormControl: new FormControl('', []),
      IsCityFormControl: new FormControl('', []),
      TaxRateFormControl: new FormControl({ value: '', disabled: true }, [Validators.required]),
      // VariableFieldNameFormControl: new FormControl({ value: '', disabled: true }),
      EffectiveDateFormControl: new FormControl('', [Validators.required]),
      FeeFormControl: new FormControl('', [
        //  Validators.required,
        Validators.pattern(Global.DECIMAL_REGEX),
        Validators.min(0),
        Validators.maxLength(10)
      ]),
      CompanyFeeFormControl: new FormControl('', [
        // Validators.required,
        Validators.pattern(Global.DECIMAL_REGEX),
        Validators.min(0),
        Validators.maxLength(10)
      ]),
      VehicleTypeFormControl: new FormControl(''),
      VehicleStoredInsideFormControl: new FormControl('')


    });
  }



  ngOnInit(): void {


    this.CurrentDate = new Date();

    this.minDate = new Date();
    //this.minDate.setDate(this.minDate.getDate() + 1);

    this.createForm();
    this.ConfigurationRatepagenumber = 1;
    this.LoadChargeType();
    // this.LoadJurisdiction();
    this.LoadVehicleType();
    this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
    this.IsStorageFee = false;
    this.IsComapanyFee = true;
  }

  navigateToDashboard() {
    let url = '/dashboard?uid=' + this.UId;
    this.router.navigateByUrl(url);
  }

  reset(): void {
    setTimeout(() => {
      this.ConfigurationRateDetailsForm.controls['ChargeTypeFormControl'].setValue(null);
    }, 1);
  }

  filterChargeType(val) {
    return val
      ? this.ChargeType.filter(s => s.FeeName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ChargeType;
  }

  displayFnChargeType(chargetype): string {
    return chargetype ? chargetype.FeeName : chargetype;
  }

  LoadChargeType(): void {
    this.ChargeType = [];
    this._dataService.get(Global.DLMS_API_URL + 'api/Rates/SelectFeeType').subscribe(
      ChargeTypes => {
        if (ChargeTypes) {         
          this.ChargeTypeList = ChargeTypes;
        } else {
          this.ChargeTypeList = [];
        }

        /*  this.filteredChargeTypes= this.ConfigurationRateDetailsForm.controls['ChargeTypeFormControl'].valueChanges
                    .startWith(null)
                    .map(chargetypes => chargetypes && typeof chargetypes === 'object' ? chargetypes.FeeName : chargetypes)
                    .map(Name => this.filterChargeType(Name)); */
      },
      error => (this.ErrorMsg = <any>error)
    );
  }

  onFeeTypeChange(event) {

    // let Obj = this.ConfigurationRateDetailsForm.value;

    this.IsStorageFee = this.ConfigurationRateDetailsForm.controls['ChargeTypeFormControl'].value.CategoryId === Global.StorageFeeCategoryId ? true : false;
    if (!this.IsStorageFee) {
      this.ConfigurationRateDetailsForm.controls['VehicleTypeFormControl'].setValue(null);
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(null);
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].enable();
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(null);
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].enable();
      this.IsComapanyFee = true;

    }
    else {

      this.IsComapanyFee = false;
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].disable();
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(true);
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].disable();
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(false);

    }

    // this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['IsTaxableFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['VariableFieldNameFormControl'].setValue(event.VariableFieldName);
    // this.ConfigurationRateDetailsForm.controls['EffectiveDateFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['FeeFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['JurisdictionFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(null);
    // this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
    // var JurisdictionControl = this.ConfigurationRateDetailsForm.controls['JurisdictionFormControl'];
    // JurisdictionControl.setErrors(null);
    // JurisdictionControl.setValue(null);
    // JurisdictionControl.markAsUntouched();
    // JurisdictionControl.markAsPristine();

    // Obj.IsVariableFormControl = event.Variable;
    // Obj.IsTaxableFormControl = event.Taxable;
    // Obj.VariableFieldNameFormControl = event.VariableFieldName;
    // Obj.TaxRateFormControl = null;
    // Obj.EffectiveDateFormControl = null;
    // Obj.FeeFormControl = null;


  }

  LoadVehicleType(): void {
    this.VehicleTypes = [];
    this._dataService
      .get(Global.DLMS_API_URL + 'api/RowSpace/LoadVehicleType').subscribe(
      VTypes => {
        if (VTypes) {
          this.VehicleTypes = VTypes;
        } else {
          this.VehicleTypes = [];
        }
      },
      error => (this.ErrorMsg = <any>error)
      );
  }

  // LoadJurisdiction(): void {
  //   this.JurisdictionList = [];
  //   this._dataService.get(Global.DLMS_API_URL + 'Common/GetJurisdiction').subscribe(
  //     Jurisdictions => {
  //       if (Jurisdictions) {
  //         this.JurisdictionList = Jurisdictions;
  //       } else {
  //         this.JurisdictionList = [];
  //       }
  //     },
  //     error => (this.ErrorMsg = <any>error)
  //   );
  // }

  FieldsChange(ev) {
    // console.log(ev);
    if (ev.checked) {
      this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].enable();
    } else {
      this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
      this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(null);
    }
  }

  // onJurisdictionChange(event) {
  //   // console.log(event);
  //   // let Obj = this.ConfigurationRateDetailsForm.value;
  //   var IsTaxable = this.ConfigurationRateDetailsForm.controls['IsTaxableFormControl'];

  //   switch (IsTaxable.value) {
  //     case true:
  //       if (event.Name !== 'None') {
  //         this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
  //       } else {
  //         this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].enable();
  //       }
  //       break;
  //     default:
  //       this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
  //       break;
  //   }
  //   this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(event.TaxRate);
  //   this.ConfigurationRateDetailsForm.controls['EffectiveDateFormControl'].setValue(null);
  //   this.ConfigurationRateDetailsForm.controls['FeeFormControl'].setValue(null);
  // }

  onJurisdictionChange(event) {

    this.DisplayInsideConfig = event.DisplayInsideConfig;

    (<FormControl>this.ConfigurationRateDetailsForm.controls['VehicleStoredInsideFormControl']).setValue('false');

  }

  integerOnly(event) {
    const e = <KeyboardEvent>event;
    if (e.key === 'Tab' || e.key === 'TAB') {
      return;
    }
    if (
      [46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode === 65 && e.ctrlKey === true) ||
      // Allow: Ctrl+C
      (e.keyCode === 67 && e.ctrlKey === true) ||
      // Allow: Ctrl+V
      (e.keyCode === 86 && e.ctrlKey === true) ||
      // Allow: Ctrl+X
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      // let it happen, don't do anything
      return;
    }
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  OpenAddNew(template: TemplateRef<any>) {
    this.ModalName = 'Add New Configure Rate';
    this.ConfigurationRateDetailsForm.reset();
    this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
    this.ErrorMsg = '';
    this.SuccessMsg = '';
    // this.LoadChargeType();
    // this.LoadJurisdiction();
    // this.LoadVehicleType();
    this.cDateId = null;
    this.saveMode = false;
    this.DisplayInsideConfig = false;
    this.modalRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }
  OpenFeeCurrent(): void {
    this.OpenFeeCurrentList(this.ConfigurationRateSearchForm.value);
  }
  OpenFeeCurrentList(ConfigurationRate) {
    var FromDate = ''; var ToDate = '';
    if (ConfigurationRate.FromDateFormControl) {
      FromDate = (ConfigurationRate.FromDateFormControl.getMonth() + 1) + '-' + ConfigurationRate.FromDateFormControl.getDate() + '-' + ConfigurationRate.FromDateFormControl.getFullYear();
    }
    if (ConfigurationRate.ToDateFormControl) {
      ToDate = (ConfigurationRate.ToDateFormControl.getMonth() + 1) + '-' + ConfigurationRate.ToDateFormControl.getDate() + '-' + ConfigurationRate.ToDateFormControl.getFullYear();
    }
    window.open('' + Global.ReportPath + '?reportName=ConfigureRates&showpdf=false&rendertopdf=false&From_Date=' + FromDate + '&To_Date=' + ToDate + '&FeeType=' + ConfigurationRate.ConfigurationRateSearchControl, '_blank');
  }
  OpenHistory(template: TemplateRef<any>, item) {
    this.ModalName = 'History';
    // this.HistoryForm.reset();
    this.ErrorMsg = '';
    this.SuccessMsg = '';
    this.cDateId = null;
    this.saveMode = false;

    this.modalRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  ClearMsg() {
    this.SuccessMsg = this.ErrorMsg = this.DeleteErrorMsg = '';
  }

  CancelConfirm() {
    this.ClearMsg();
    this.modalRef.hide();
  }

  CloseConfirm() {
    this.ClearMsg();
    this.modalConfirmRef.hide();
  }

  CloseModal() {
    this.ClearMsg();
    this.modalRef.hide();
  }
  closeAuditRatesDetailsRef() {
    this.ClearMsg();
    this.modaltemplateAuditReleaseDetailsRef.hide();
  }
  OpenConfirm(template: TemplateRef<any>, item) {
    // console.log(item);
    this.ClearMsg();
    this.ModalName = 'Confirm Delete';
    this.ConfirmMessage = Global.RemoveConfirmationMessage;
    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);

    this.cDateId = item.Id;
    // this.DeleteIndex = index;
    this.ModalType = 'delete';
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  OkConfirm(index: number) {
    this.ClearMsg();
    if (this.ModalType === 'delete') {
      this.DeleteConfigureRate(this.cDateId);
    } else {
      this.CancelConfirm();
    }
  }

  DeleteConfigureRate(id) {
    this.indLoading = true;
    const ObjA: DeleteFeeModel = new DeleteFeeModel();
    ObjA.FeeXREFId = id;
    ObjA.UserId = this.UId;
    // console.log(ObjA);
    this._dataService.post(Global.DLMS_API_URL + 'api/Rates/DeleteTowConfigurationFee', ObjA).subscribe(result => {
      if (result.Id > 0) {
        this.CloseConfirm();
        this.SuccessMsg = Global.DeleteMessage;
        this.indLoading = false;
        this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
      } else {
        this.ErrorMsg = result.Result;
        this.indLoading = false;
      }
    }, error => {
      this.indLoading = false;
      this.ErrorMsg = <any>error;
    });
  }

  SearchConfigurationRateList(): void {
    this.ErrorMsg = '';
    this.SuccessMsg = '';
    this.ConfigurationRatepagenumber = 1;
    this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
  }

  LoadConfigurationRateList(ConfigurationRate): void {
    this.indLoadingModal = true;
    var FromDate = ''; var ToDate = '';
    if (ConfigurationRate.FromDateFormControl) {
      FromDate = (ConfigurationRate.FromDateFormControl.getMonth() + 1) + '-' + ConfigurationRate.FromDateFormControl.getDate() + '-' + ConfigurationRate.FromDateFormControl.getFullYear();
    }
    if (ConfigurationRate.ToDateFormControl) {
      ToDate = (ConfigurationRate.ToDateFormControl.getMonth() + 1) + '-' + ConfigurationRate.ToDateFormControl.getDate() + '-' + ConfigurationRate.ToDateFormControl.getFullYear();
    }
    if (ConfigurationRate.ConfigurationRateSearchControl == null) {
      ConfigurationRate.ConfigurationRateSearchControl = '';
    }
    this.ErrorMsg = '';
    this._dataService.get(Global.DLMS_API_URL + 'api/Rates/SelectFeeDetails?pageOffset=' + this.ConfigurationRatepagenumber + '&pageSize=1000&Id=&keyValue=' + ConfigurationRate.ConfigurationRateSearchControl + '&FromDate=' + FromDate + '&Todate=' + ToDate)
      .subscribe(ConfigurationRateLists => {
        //  console.log(JSON.stringify( ConfigurationRateLists));
        if (ConfigurationRateLists) {
          this.ConfigurationRateList = ConfigurationRateLists;

          if (this.ConfigurationRateList.length > 0) {
            this.HasRecords = true;
            this.ConfigurationRatetotalpagenum = ConfigurationRateLists[0]['TotalPages'];
            this.ConfigurationRatetotalPageCount = [];
            for (let i = 1; i <= ConfigurationRateLists[0]['TotalPages']; i++) {
              this.ConfigurationRatetotalPageCount.push({ Id: i, Description: i });
            }
            if (this.ConfigurationRatepagenumber === 1) {
              this.ConfigurationRatePageId = 1;
            }
            this.ConfigurationRateTotalRecord = 'Total Record Found: ' + ConfigurationRateLists[0]['TotalRecords'];
          }
        } else {
          this.HasRecords = false;
          this.ConfigurationRatetotalPageCount = [];
          this.ConfigurationRateTotalRecord = '';
        }

        this.indLoadingModal = false;
      },
      error => {
        this.indLoadingModal = false;
        this.ErrorMsg = <any>error;
      }
      );
  }
  AuditRates(template: TemplateRef<any>, item) {
    this.ModalName = item.FeeName;
    this.AuditRatesDetails(item.FeeId, item.Id);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateAuditReleaseDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }
  AuditRatesDetails(FeeId, Id) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Rates/SelectAuditConfigureRates?FeeId=' + FeeId + '&Id=' + Id)
      .subscribe(res => {
        this.AuditRatesDetailsList = res;

      },
      error => (this.ErrorMsg = <any>error));
  }
  OpenFeeHistory(item) {
    window.open('' + Global.ReportPath + '?reportName=ConfigureRatesHistory&showpdf=false&rendertopdf=false&FeeName=' + item.FeeId + '&VehicleTypeId=' + item.Id, '_blank');
  }
  onPageChangeConfigurationRateList(PageNumber: any) {
    this.ErrorMsg = '';
    this.SuccessMsg = '';

    this.ConfigurationRatepagenumber = this.ConfigurationRatePageId;
    this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
  }

  firstConfigurationRateList() {
    if (this.ConfigurationRatePageId === 'undefined' || this.ConfigurationRatePageId > 1) {
      this.ErrorMsg = '';
      this.SuccessMsg = '';
      this.ConfigurationRatepagenumber = 1;
      this.ConfigurationRatePageId = this.ConfigurationRatepagenumber;
      this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
    }
  }

  previousConfigurationRateList() {
    if (this.ConfigurationRatePageId !== 'undefined') {
      if (this.ConfigurationRatePageId > 1) {
        this.ErrorMsg = '';
        this.SuccessMsg = '';

        this.ConfigurationRatepagenumber = this.ConfigurationRatePageId - 1;
        this.ConfigurationRatePageId = this.ConfigurationRatepagenumber;
        this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
      }
    }
  }

  nextConfigurationRateList() {
    if (this.ConfigurationRatePageId !== 'undefined') {
      if (this.ConfigurationRatePageId < this.ConfigurationRatetotalpagenum) {
        this.ErrorMsg = '';
        this.SuccessMsg = '';

        this.ConfigurationRatepagenumber = this.ConfigurationRatePageId + 1;
        this.ConfigurationRatePageId = this.ConfigurationRatepagenumber;
        this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
      }
    }
  }

  lastConfigurationRateList() {
    if (
      this.ConfigurationRatePageId === 'undefined' ||
      this.ConfigurationRatePageId < this.ConfigurationRatetotalpagenum
    ) {
      this.ErrorMsg = '';
      this.SuccessMsg = '';

      this.ConfigurationRatepagenumber = this.ConfigurationRatetotalpagenum;
      this.ConfigurationRatePageId = this.ConfigurationRatepagenumber;
      this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
    }
  }

  SaveConfigurationRate(ObjConfigurationRate, Isclose: number) {

    //console.log(ObjConfigurationRate)

    this.ErrorMsg = '';
    this.SuccessMsg = '';
    this.formSubmitAttempt = true;
    if (this.ConfigurationRateDetailsForm.valid) {
      if (!ObjConfigurationRate.FeeFormControl && !ObjConfigurationRate.CompanyFeeFormControl) {
        this.ErrorMsg = 'Please input Customer Rate or Company Rate.';
        return;
      }


      this.ConfigurationRateModelDetail.FeeDateId = this.cDateId;

      this.ConfigurationRateModelDetail.FeeId = ObjConfigurationRate.ChargeTypeFormControl.FeeId;
      if (!ObjConfigurationRate.ChargeTypeFormControl.FeeId) {
        this.ErrorMsg = 'Fee is invalid';
        return;
      }



      if (this.ConfigurationRateDetailsForm.controls['ChargeTypeFormControl'].value.CategoryId === Global.StorageFeeCategoryId) {
        if (!ObjConfigurationRate.VehicleTypeFormControl) {
          this.ErrorMsg = 'Vehicle Type is Required';
          return;
        }
        else {
          this.ConfigurationRateModelDetail.VehicleTypeId = ObjConfigurationRate.VehicleTypeFormControl.Id;
        }
      } else {
        this.ConfigurationRateModelDetail.VehicleTypeId = null;
      }



      if (ObjConfigurationRate.EffectiveDateFormControl) {
        var EffectiveDate = ObjConfigurationRate.EffectiveDateFormControl.getMonth() + 1 + '-' + ObjConfigurationRate.EffectiveDateFormControl.getDate() + '-' + ObjConfigurationRate.EffectiveDateFormControl.getFullYear();
      }

      this.ConfigurationRateModelDetail.EffectiveDate = EffectiveDate;
      var ConfigurationRate = ObjConfigurationRate.FeeFormControl;
      var dolar = /[$]/gi;
      // if (ConfigurationRate.search(dolar) === -1) {
      this.ConfigurationRateModelDetail.Fee = ObjConfigurationRate.FeeFormControl;
      // } else {
      //   this.ConfigurationRateModelDetail.Fee = ObjConfigurationRate.FeeFormControl.substring(1);
      // }
      this.ConfigurationRateModelDetail.CompanyFee = ObjConfigurationRate.CompanyFeeFormControl;
      this.ConfigurationRateModelDetail.IsCity = ObjConfigurationRate.IsCityFormControl;
      this.ConfigurationRateModelDetail.CreatedBy = 1;//this.UId;// Number(this.localStorageService.get('UserId'));
      // this.ConfigurationRateModelDetail.XrefId = this.XrefId;
      this.ConfigurationRateModelDetail.TaxRate = ObjConfigurationRate.TaxRateFormControl;
      this.ConfigurationRateModelDetail.Taxable = ObjConfigurationRate.IsTaxableFormControl;
      this.ConfigurationRateModelDetail.Editable = ObjConfigurationRate.IsEditableFormControl;
      this.ConfigurationRateModelDetail.Variable = ObjConfigurationRate.IsVariableFormControl;
      this.ConfigurationRateModelDetail.IsVehicleStoredInside = false;
      if (this.IsStorageFee) {
        this.ConfigurationRateModelDetail.Variable = true;
        if (ObjConfigurationRate.VehicleStoredInsideFormControl == "true") {
          this.ConfigurationRateModelDetail.IsVehicleStoredInside = true;
        }
        else {
          this.ConfigurationRateModelDetail.IsVehicleStoredInside = false;
        }

      }

      if (ObjConfigurationRate.VehicleStoredInsideFormControl) {

        var EffectiveDate = ObjConfigurationRate.EffectiveDateFormControl.getMonth() + 1 + '-' + ObjConfigurationRate.EffectiveDateFormControl.getDate() + '-' + ObjConfigurationRate.EffectiveDateFormControl.getFullYear();
      }
      // if (ObjConfigurationRate.TaxRateFormControl) {
      //   this.ConfigurationRateModelDetail.TaxRate = ObjConfigurationRate.TaxRateFormControl;
      // } else {
      //   this.ConfigurationRateModelDetail.TaxRate = ObjConfigurationRate.JurisdictionFormControl.TaxRate;
      // }
      this.indLoadingModal = true;      
      this._dataService.post(Global.DLMS_API_URL + 'api/Rates/SaveFee', this.ConfigurationRateModelDetail)
        .subscribe(TowCompanyOwnerModels => {
          this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
          if (this.saveMode) {
            this.SuccessMsg = Global.UpdateMessage;
          } else {
            this.SuccessMsg = Global.SaveMessage;
            this.saveMode = true;
          }
          // if (ConfigurationRate.search(dolar) === -1) {
          (<FormControl>this.ConfigurationRateDetailsForm.controls['FeeFormControl']).setValue(parseFloat(ConfigurationRate.toString()).toFixed(2));
          // } else if (ConfigurationRate.search(dolar) > -1) {
          //   (<FormControl>this.ConfigurationRateDetailsForm.controls['FeeFormControl']).setValue(parseFloat(ConfigurationRate.substring(1).toString()).toFixed(2));
          // }

          if (Isclose === 1) {
            this.modalRef.hide();
          }
        },
        error => {
          this.indLoadingModal = false;
          this.ErrorMsg = <any>error;
        }
        );
    } else {
      this.validateAllFormFields(this.ConfigurationRateDetailsForm);
    }
  }

  EditConfigurationRate(template: TemplateRef<any>, item) {
    //console.log(item)
    //console.log(this.VehicleTypes)
    this.ConfigurationRateDetailsForm.reset();
    this.ModalName = 'Edit Configure Rate';
    this.cDateId = item.Id;
    this.ErrorMsg = '';
    this.SuccessMsg = '';
    this.saveMode = true;
    this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(item.Editable);
    this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(item.Variable);
    this.ConfigurationRateDetailsForm.controls['IsTaxableFormControl'].setValue(item.Taxable);
    this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(item.TaxRate);
    if (item.Taxable) {
      this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].enable();
    } else {
      this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].disable();
    }
    this.ConfigurationRateDetailsForm.controls['IsCityFormControl'].setValue(item.IsCity);

    if (item.IsVehicleStoredInside) {
      (<FormControl>this.ConfigurationRateDetailsForm.controls['VehicleStoredInsideFormControl']).setValue('true');
    }


    const SelectedFee = this.ChargeTypeList.find(m => m.FeeId === item.FeeId);

    this.ConfigurationRateDetailsForm.controls['ChargeTypeFormControl'].setValue(SelectedFee);
    // (<FormControl>this.ConfigurationRateDetailsForm.controls['JurisdictionFormControl']).setValue(SelectedJurisdiction);
    // if (SelectedFee.Taxable) {
    //   if (SelectedJurisdiction) {
    //     this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(SelectedJurisdiction.TaxRate);
    //   } else {
    //     this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(item.TaxRate);
    //   }
    // } else {
    //   this.ConfigurationRateDetailsForm.controls['TaxRateFormControl'].setValue(null);
    // }
    const VehicleTypeId = this.VehicleTypes.find(m => m.Id === item.VehicleTypeId);

    if (VehicleTypeId) {
      this.ConfigurationRateDetailsForm.controls['VehicleTypeFormControl'].setValue(VehicleTypeId);
    }

    if (SelectedFee.CategoryId === Global.StorageFeeCategoryId) {
      // var SelectedVehicleTypeId = this.VehicleTypes.find(m => m.VehicleTypeId === item.VehicleTypeId);
      // (<FormControl>
      this.IsStorageFee = true;
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].disable();
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(false);
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].disable();
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(true);
    } else {
      this.IsStorageFee = false;
      //  this.ConfigurationRateDetailsForm.controls['VehicleTypeFormControl'].setValue(null);
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].enable();
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].enable();
    }

    if (item.EffectiveDate) {
      const CreatedDate = new Date(item.EffectiveDate);
      if (CreatedDate.toString() === '1/1/1970') {
      } else {
        this.ConfigurationRateDetailsForm.controls['EffectiveDateFormControl'].setValue(CreatedDate);
      }
    }

    // this.ConfigurationRateDetailsForm.controls['FeeFormControl'].setValue('$' + parseFloat(item.Fee.toString()).toFixed(2));
    if (item.Fee) {
      this.ConfigurationRateDetailsForm.controls['FeeFormControl'].setValue(parseFloat(item.Fee.toString()).toFixed(2));
    }
    if (item.CompanyFee) {
      this.ConfigurationRateDetailsForm.controls['CompanyFeeFormControl'].setValue(parseFloat(item.CompanyFee.toString()).toFixed(2));
    }
    this.modalRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }
  Clear() {
    (<FormControl>this.ConfigurationRateSearchForm.controls['ConfigurationRateSearchControl'])
      .setValue(null);
    (<FormControl>this.ConfigurationRateSearchForm.controls['FromDateFormControl'])
      .setValue(null);
    (<FormControl>this.ConfigurationRateSearchForm.controls['ToDateFormControl'])
      .setValue(null);
    this.LoadConfigurationRateList(this.ConfigurationRateSearchForm.value);
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

  isnull(obj, replacevalue: any): any {
    return obj ? obj : replacevalue;
  }

  toggleRow(cl, i, Id: any) {
    this.showIndex = this.showIndex === i ? -1 : i;
    this.FeeHistoryRateList = [];
    this.indLoadingModal = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Rates/SelectFeeHistory?pageOffset=1&pageSize=1000&Id=' + Id)
      .subscribe(historyLists => {
        if (historyLists) {
          this.FeeHistoryRateList = historyLists;
        } else {

        }

        this.indLoadingModal = false;
      },
      error => {
        this.indLoadingModal = false;
        this.ErrorMsg = <any>error;
      }
      );

  }

  onEditableChange(obj) {
    if (obj.checked === true) {
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(true);
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(false);
    }
  }
  onVariableChange(obj) {
    if (obj.checked === true) {
      this.ConfigurationRateDetailsForm.controls['IsVariableFormControl'].setValue(true);
      this.ConfigurationRateDetailsForm.controls['IsEditableFormControl'].setValue(false);
    }
  }
}

class ConfigurationRateModel {
  FeeDateId: number;
  FeeId: number;
  VehicleTypeId?: number;
  JurisdictionId: number;
  Fee: number;
  EffectiveDate: string;
  CreatedBy: number;
  TaxRate: number;
  Taxable: boolean;
  Editable: boolean;
  Variable: boolean;
  IsVehicleStoredInside: boolean;
  CompanyFee: number;
  IsCity: boolean;
}

class DeleteFeeModel {
  FeeXREFId: number;
  UserId: number;
}
