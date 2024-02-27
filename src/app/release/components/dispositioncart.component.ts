import { Component, OnInit, TemplateRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Global } from 'src/app/shared/global';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'angular-2-local-storage';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DomSanitizer } from '@angular/platform-browser';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
import twainscanner from '../../../assets/js/twainscanner';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'dispositioncart',
  templateUrl: './dispositioncart.component.html',
  styleUrls: ['./dispositioncart.component.css'],
  providers: [DatePipe, CurrencyPipe]
})
export class DispositionCartComponent implements OnInit, OnDestroy {
  @Input()
  DispositionButtonPermissionList = [];
  Dispositionaddfee: boolean;
  Dispositionsavefee: boolean;
  Dispositiondeletefee: boolean;
  Dispositionwaivefee: boolean;
  DispositionSaveFees: boolean;
  DispositionPrintReceipt: boolean;
  DispositionSaveRelease: boolean;
  DispositionAddFees: boolean;
  DispositionWaiveFees: boolean;
  DispositionImpoundRelease: boolean;
  DispositionAuditFees: boolean;
  DispositionPrintFees: boolean;
  DispositionReversePayment: boolean;
  DispositionAuditPayment: boolean;
  DispositionAuditRelease: boolean;
  DispositionFeeDetails: boolean;
  DispositionReleaseDetails: boolean;
  DispositionProjectFee: boolean;
  FeeGrid = [];
  FeeMainGrid = [];
  maingrandTotal = 0;
  grandTotal = 0;
  PaymentDue = 0;
  TotalBidAmt = 0;
  ChangeAmt = 0;
  TotalPaid = 0;
  HasRecords = false;
  isReloFeeExists = false;
  ErrorMsg: string;
  DeleteErrorMsg: string;
  SuccessMsg: string;
  ConfirmMessage: string;
  FromTab: string;
  ToTab: string;
  CitationForm: FormGroup;
  CurrentDate: Date;
  Count: number;
  public modalConfirmRef: BsModalRef;
  @ViewChild('templateConfirm')
  public TemplateConfirmRef: TemplateRef<any>;
  ServerTime: any;
  ModalName: string;
  ModalType: string;
  DriveModeList = [{ 'ID': '1', 'Name': 'Driven' }, { 'ID': '2', 'Name': 'Towed' }];
  phonemask: any[] = Global.phonemask;
  SelectedTowComapnyid: number;
  SelectedTowComapny: any;
  ReleaseToNameList = [];
  showNameText = false;
  isAdministrativeRelease = false;
  isTowCompanyRelease = false;
  ReceiptNo: any;
  IsLocked: boolean;
  indModalLoading = false;
  DeleteIndex: number;
  ImpoundReleaseErrorMsg: string;
  ReleaseToList = [];
  CompanyList = [];

  PageId: number;
  RoleId: number;
  UserId: number;
  Guid: string;
  EnterpriseId: number;
  UserName: string;
  TowId: number;
  RecordId: string;
  VehicleRecordId: string;
  VehicleStatus: any;
  SelectReleaseToInsurance: any = null;
  IsHold: any;
  StorageStatusId: number;
  IsReleased: boolean;
  LoaderImage: string;
  ModalLoaderImage: string;
  indLoading = false;
  loading: number;
  deleteloading: number;
  scanLoading: number;
  viewLoading: number;
  FeeList = [];
  SearchList = [];
  bodyCitations = false;
  bodyPermits = false;
  bodyPayment = false;
  bodyTowStorage = false;
  bodyReleaseCheckList = false;
  bodyPaymentPlan = false;
  bodyDMV = false;
  bodyRefund = false;
  bodyAdditionalPayment = false;
  bodyUpdatePaymentTransaction = false;
  documentUrl: any;
  DLMSPath = Global.PoliceURL;
  checkListSchemaList = [];
  uploadedDocs = [];
  checkListErrorMsg: string;
  checkListSuccessMsg: string;
  documentDetails: any;
  PermitId: number;
  CitationId: number;
  DMVID: number;
  PaymentPlanId: number;

  totalofCitations = 0;
  totalofPermits = 0;
  totalofPaymentPlan = 0;
  totalofDMV = 0;
  totalofAP = 0;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  @ViewChild('templateRecordList') modaltemplateRecordListRef: BsModalRef;
  @ViewChild('templateFeeGrid') modaltemplateFeeGridRef: BsModalRef;
  @ViewChild('templateRecordList') public templateRecordListRef: TemplateRef<any>;
  @ViewChild('templateReleaseTo') modaltemplateReleaseToRef: BsModalRef;
  @ViewChild('templateDocumentViewer') modaltemplateDocumentViewerRef: BsModalRef;
  public CompanymodalRef: BsModalRef;
  parentScreenData: any;
  citationSearchData: any;
  CIDataList = [];
  serviceCitationsData: any;
  servicePermitsData: any;
  servicePaymentPlanData: any;
  serviceDMVData: any;
  subscription: Subscription;
  submitted = false;
  ParentScreen = 'Cashiering';
  IsInterval: any;
  IsCloverRadioButtonEnable: boolean;
  IsOnlinePaid: any = 0;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private modalService: BsModalService,
    public sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private commService: CommunicationService) {
    this.LoaderImage = this.ModalLoaderImage = Global.FullImagePath;
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
    this.activatedRoute.queryParams.subscribe(params => {
      this.PageId = params.PageId;
      this.RoleId = params.RoleId;
      this.TowId = params.TID;
      this.UserId = params.uid;
      // document.getElementById("userId").innerHTML = this.UserId.toString();
      if (params.Id) {
        this.Guid = params.Id;
      }
      else {
        this.Guid = this.localStorageService.get('GUID');
      }
      if (this.localStorageService.get('EnterpriseId') != null) {
        this.EnterpriseId = this.localStorageService.get('EnterpriseId');
      }
      localStorage.setItem('hsn', params.hsn);
      localStorage.setItem('SessionId',params.sessionId);
      localStorage.setItem('TowId', this.TowId.toString());
      this.UserName = this.localStorageService.get('UserName');
    });

    this.subscription = this.commService.getCitationsData().subscribe(res => {
      if (res) {
        this.serviceCitationsData = res.citations;
        this.totalofCitations = res.citations.totalofCitations;
      }
    });

    this.subscription = this.commService.getPermitsData().subscribe(res => {
      if (res) {
        this.servicePermitsData = res.permits;
        this.totalofPermits = res.permits.totalofPermits;
      }
    });

    this.subscription = this.commService.getPaymentPlanData().subscribe(res => {
      if (res) {
        this.servicePaymentPlanData = res.paymentPlan;
        this.totalofPaymentPlan = res.paymentPlan.totalofPaymentPlan;
      }
    });

    this.subscription = this.commService.getClearCashiering().subscribe(res => {
      if (res) {
        this.CitationForm.reset();
      }
    });

    this.subscription = this.commService.getDMVData().subscribe(res => {
      if (res) {
        this.serviceDMVData = res.dmv;
        this.totalofDMV = res.dmv.totalofDMV;
      }
    });

    this.subscription = this.commService.getAPData().subscribe(res => {
      if (res) {
        this.totalofAP = res.ap.totalofAP;
      }
    });

    this.subscription = this.commService.getPaymentCartData().subscribe(res => {
      if (res) {
        this.PaymentDue = res.cart.PaymentDue;
        this.ChangeAmt = res.cart.ChangeAmt;
        this.ReceiptNo = res.cart.ReceiptNo;
      }
    });

    this.subscription = this.commService.getSummeryData().subscribe(res => {
      if (res) {
        if (typeof res.summeryItem.totalofPaymentPlan != 'undefined') {
          this.totalofPaymentPlan = res.summeryItem.totalofPaymentPlan;
        }
        if (typeof res.summeryItem.totalofPermits != 'undefined') {
          this.totalofPermits = res.summeryItem.totalofPermits;
        }
        if (typeof res.summeryItem.totalofDMV != 'undefined') {
          this.totalofDMV = res.summeryItem.totalofDMV;
        }
        if (typeof res.summeryItem.totalofCitations != 'undefined') {
          this.totalofCitations = res.summeryItem.totalofCitations;
        }
        if (typeof res.summeryItem.totalofAP != 'undefined') {
          this.totalofAP = res.summeryItem.totalofAP;
        }

        this.getSumSummary(this.totalofCitations, this.totalofPermits, this.totalofDMV, this.totalofAP, this.totalofPaymentPlan);
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
  }

  ngOnInit(): void {
    this.LoadDispositionButtonPermission(this.PageId, this.RoleId);
    twainscanner.RegisterDynamsoft();
    this.initForm();
    this.SelectedTowComapny = '';
    this.SelectedTowComapnyid = 0;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
    localStorage.removeItem('hsn');
  }

  get cf() { return this.CitationForm.controls; }

  initForm() {
    this.CitationForm = this.fb.group({
      searchTypeFormControl: ['', Validators.required],
      licensePlateFormControl: [''],
      stateFormControl: [''],
      citationNoFormControl: [''],
      vinNoFormControl: [''],
      firstNameFormControl: [''],
      lastNameFormControl: ['']
    });

    this.cf.searchTypeFormControl.setValue('P');
  }

  getSumSummary(totalofCitations, totalofPermits, totalofDMV, totalofAP, totalofPaymentPlan) {
    return this.PaymentDue = totalofCitations + totalofPermits + totalofDMV + totalofAP + totalofPaymentPlan
  }

  onSearchType(ev) {
    this.cf.citationNoFormControl.clearValidators();
    this.cf.citationNoFormControl.updateValueAndValidity();
    this.cf.vinNoFormControl.clearValidators();
    this.cf.vinNoFormControl.updateValueAndValidity();
    this.cf.firstNameFormControl.clearValidators();
    this.cf.firstNameFormControl.updateValueAndValidity();
    this.cf.lastNameFormControl.clearValidators();
    this.cf.lastNameFormControl.updateValueAndValidity();
    this.cf.licensePlateFormControl.clearValidators();
    this.cf.licensePlateFormControl.updateValueAndValidity();
    let searchType = this.cf.searchTypeFormControl.value;
    switch (searchType) {
      case "C":
        this.cf.citationNoFormControl.setValidators([Validators.required]);
        this.cf.citationNoFormControl.updateValueAndValidity();
        break;
      case "N":
        this.cf.firstNameFormControl.setValidators([Validators.required]);
        this.cf.firstNameFormControl.updateValueAndValidity();
        this.cf.lastNameFormControl.setValidators([Validators.required]);
        this.cf.lastNameFormControl.updateValueAndValidity();
        break;
      case "P":
        this.cf.licensePlateFormControl.setValidators([Validators.required]);
        this.cf.licensePlateFormControl.updateValueAndValidity();
        break;
      case "V":
        this.cf.vinNoFormControl.setValidators([Validators.required]);
        this.cf.vinNoFormControl.updateValueAndValidity();
        break;
      default:
        this.cf.citationNoFormControl.clearValidators();
        this.cf.citationNoFormControl.updateValueAndValidity();
        this.cf.firstNameFormControl.clearValidators();
        this.cf.firstNameFormControl.updateValueAndValidity();
        this.cf.lastNameFormControl.clearValidators();
        this.cf.lastNameFormControl.updateValueAndValidity();
        this.cf.licensePlateFormControl.clearValidators();
        this.cf.licensePlateFormControl.updateValueAndValidity();
        this.cf.vinNoFormControl.clearValidators();
        this.cf.vinNoFormControl.updateValueAndValidity();
        break;
    }
  }

  searchCitations() {
    this.ErrorMsg = this.SuccessMsg = '';
    this.submitted = true;
    if (this.CitationForm.invalid) {
      return;
    }
    this.citationSearchData = {
      'searchType': this.cf.searchTypeFormControl.value,
      'licensePlate': this.cf.licensePlateFormControl.value,
      'state': this.cf.stateFormControl.value,
      'citationNo': this.cf.citationNoFormControl.value,
      'vinNo': this.cf.vinNoFormControl.value,
      'firstName': this.cf.firstNameFormControl.value,
      'lastName': this.cf.lastNameFormControl.value
    }
  }

  clearCashiering() {
    console.log('fired');
    this.CitationForm.reset();
    this.commService.sendClearCashiering('clear');

    this.PaymentDue = 0;
    this.ChangeAmt = 0;
    this.ReceiptNo = '';
    this.totalofCitations = 0;
    this.totalofDMV = 0;
    this.totalofPermits = 0;
    this.totalofPaymentPlan = 0;
    this.totalofAP = 0;

    this.cf.searchTypeFormControl.setValue('P');

    // window.parent.location.reload();
    window.top.location.href = Global.PoliceURL + "Officer/Cashiering.aspx";
  }

  LoadDispositionButtonPermission(PageId, RoleId): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.DispositionButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.DispositionButtonPermissionList.length; i++) {
            // if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'savefee') {
            //   this.Dispositionsavefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'deletefee') {
            //   this.Dispositiondeletefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'waivefee') {
            //   this.Dispositionwaivefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'addfee') {
            //   this.Dispositionaddfee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'SaveFees') {
            //   this.DispositionSaveFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditFees') {
            //   this.DispositionAuditFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'PrintFees') {
            //   this.DispositionPrintFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'SaveRelease') {
            //   this.DispositionSaveRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditPayment') {
            //   this.DispositionAuditPayment = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditRelease') {
            //   this.DispositionAuditRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ImpoundRelease') {
            //   this.DispositionImpoundRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'FeeDetails') {
            //   this.DispositionFeeDetails = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ReleaseDetails') {
            //   this.DispositionReleaseDetails = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ReversePayment') {
            //   this.DispositionReversePayment = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'PrintReceipt') {
            //   this.DispositionPrintReceipt = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            // }else 
            if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'IsCloverEnable') {
              this.IsCloverRadioButtonEnable = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            }
          }
        }
      },
        error => { this.ErrorMsg = <any>error });
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
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'].indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  towStorageSearch() {
    this.ErrorMsg = this.SuccessMsg = '';
    this.indLoading = true;
    var licensePlate = (<HTMLInputElement>document.getElementById("licensePlate")).value;
    var vehVinNum = (<HTMLInputElement>document.getElementById("VIN")).value;
    var recordID = (<HTMLInputElement>document.getElementById("recordID")).value;
    let param = 'pageNumber=1&pageSize=100&vehPlateNum=' + licensePlate + '&vehVinNum=' + vehVinNum + '&recordId=' + recordID;
    this._dataService.get(Global.DLMS_API_URL + 'SearchTowedVehicle/GetTowingSearch?' + param).subscribe(res => {
      if (res && res.length > 0) {
        this.modaltemplateRecordListRef = this.modalService.show(this.templateRecordListRef, Object.assign({}, this.config, { class: 'gray modal-lg' }));
        this.SearchList = res;
        this.indLoading = false;
      } else {
        this.ErrorMsg = 'No Record Found';
        this.indLoading = false;
      }
    },
      error => {
        this.ErrorMsg = <any>error;
        this.indLoading = false;
      }
    );
  }

  Pay(ind, tabName) {
    if (ind == 'No') {
      this.toggle('bodyPayment');
      // this.PayForm.controls['releasedBy'].disable();
      // this.PayForm.controls.releasedBy.setValue(this.UserName);
      // this.PayForm.controls['nametxt'].disable();
      switch (tabName) {
        case 'TowStorage':
          this.toggle('bodyTowStorage');
          this.FromTab = 'TowStorage'
          this.ToTab = 'Payment'
          break;
        case 'Tickets':
          this.toggle('bodyCitations');
          this.FromTab = 'Tickets'
          this.ToTab = 'Payment'
          break;
        case 'Permits':
          this.toggle('bodyPermits');
          this.FromTab = 'Permits'
          this.ToTab = 'Payment'
          break;
        case 'PaymentPlan':
          this.toggle('bodyPaymentPlan');
          this.FromTab = 'PaymentPlan'
          this.ToTab = 'Payment'
          break;
        case 'DMV':
          this.toggle('bodyDMV');
          this.FromTab = 'DMV'
          this.ToTab = 'Payment'
          break;
      }
    }
  }

  toggle(key) {
    switch (key) {
      case "bodyTowStorage":
        this.bodyTowStorage = !this.bodyTowStorage;
        break;
      case "bodyReleaseCheckList":
        this.bodyReleaseCheckList = !this.bodyReleaseCheckList;
        break;
      case "bodyCitations":
        this.bodyCitations = !this.bodyCitations;
        break;
      case "bodyPermits":
        this.bodyPermits = !this.bodyPermits;
        break;
      case "bodyPaymentPlan":
        this.bodyPaymentPlan = !this.bodyPaymentPlan;
        break;
      case "bodyDMV":
        this.bodyDMV = !this.bodyDMV;
        break;
      case "bodyPayment":
        this.bodyPayment = !this.bodyPayment;
        break;
      case "bodyRefund":
        this.bodyRefund = !this.bodyRefund;
        break;
      case "bodyAdditionalPayment":
        this.bodyAdditionalPayment = !this.bodyAdditionalPayment;
        break;
      case "bodyUpdatePaymentTransaction":
        this.bodyUpdatePaymentTransaction = !this.bodyUpdatePaymentTransaction;
        break;
    }
  }

  nextTab(fromTab, toTab) {
    this.toggle('body' + toTab);
    // this.toggle('body' + fromTab);
  }

  isnull(obj, replacevalue: any): any {
    return obj ? obj : replacevalue;
  }

  validateAllFormFields(formGroup: any) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
      else if (control instanceof FormArray) {
        this.validateAllFormFields(control);
      }
    });
  }
}

class SaveFeeModel {
  TowFeesId: number;
  TowId: number;
  ChargeId: number;
  Description: string;
  Rate: number;
  Quantity: number;
  Amount: number;
  Tax: number;
  TaxAmount: number;
  WaiveAmount: number;
  WaiveReasonId: number;
  OtherWaiveReason: string;
  SubTotal: number;
  Total: number;
  PaidId: number;
  DisplayNo: number;
  UserId: number;
  DeleteFlag: number;
  FeeXREFId: number;
  ReportingAgencyId: number;
  CategoryId: number;
  GuId: string;
}

class UploadDocumentModel {
  TowingId: number;
  Base64File: string;
  DocName: string;
  DocDescription: string;
  AttachmentTypeId: number;
  FileSize: number;
  ContentType: string;
  IsActive: boolean;
  UserId: number;
  RecordId: string;
}

class ReleaseSaveModel {
  ReleaseToInfo: ReleaseToInfoType[];
  ReleasePayments: ReleasePaymentsType[];
}

class ReleasePaymentsType {
  TowId: number;
  PaymentTypeId: number;
  Amount: number;
  ChequeNo: string;
}

class ReleaseToInfoType {
  TowId: number;
  VehicleReleasedDate: string;
  ReleasedTo: string;
  OwnerId: number;
  OwnerFirstName: string;
  Address: string;
  ReleasePhoneNum: string;
  IdNum: string;
  ReleasedNotes: string;
  FeeChangeAmount: number;
  ReleasedBy: any;
  UserId: number;
  ReportingAgencyId: number;
  GuidId: string;
  ReleaseSignature: string;
  Email: string;
  IsMob: boolean;
  TowCompanyId: number;
}

class SaveImpoundReleaseModel {
  TowId: number;
  StorageStatusId: number;
  DriveMode: number;
  ImpoundReleasedDate: string;
  ImpoundReleasedBy: number;
}