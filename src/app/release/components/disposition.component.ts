import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef, Inject, ElementRef, NgZone, AfterViewInit, ComponentFactoryResolver, ViewContainerRef, OnDestroy } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Global } from '../../shared/global';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavigationService } from '../../shared/components/navigation/navigation.service';
import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { LocalStorageService } from 'angular-2-local-storage';
import { TowService } from 'src/app/tow/Tow.service';
import * as FileSaver from 'file-saver';
import {
  AbstractControl,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormBuilder,
  FormArray
} from '@angular/forms';
import {
  MatOptionSelectionChange,
  MatTableDataSource,
  MatPaginator,
  MatSort
} from '@angular/material';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { Subscription } from 'rxjs';
import { CommunicationService } from 'src/app/core/services/app.communication.service';
import signature from '../../../assets/js/signature';
import { ReleaseChecklistComponent } from './releasechecklist/releasechecklist.component';
import { UtilService } from 'src/app/core/services/util.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  // tslint:disable-next-line:component-selector
  selector: 'disposition',
  templateUrl: './disposition.component.html',
  styleUrls: ['./disposition.component.css'],
  providers: [DatePipe, CurrencyPipe]
})
export class DispositionComponent implements OnInit, OnDestroy {
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
  HasUploadPermission: boolean = false;
  HasScanPermission: boolean = false;
  TowId: number;
  DispositionTowId: string;
  ReleaseToInsuranceId: number;
  currSignature: any;
  feeDetails: any;
  VehicleStatus: any;
  IsHold: any;
  VehicleRecordId: any;
  VehicleTypes: any = [];
  FeeTypes = [];
  FeeGrid = [];
  hours: any = [];
  minutes: any = [];
  LoaderImage: any;
  ModalLoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  ModalErrorMsg: string;
  ModalSuccessMsg: string;
  WaiveErrorMsg: string;
    RemovePlateErrorMsg: string;
  ImpoundReleaseErrorMsg: string;
  SelectReleaseToInsurance: any = null;

  DeleteErrorMsg: any;
  ConfirmMessage: any;
  DeleteIndex: number;
  SelectedTowComapnyid: number;
  SelectedTowComapny: any;
  @ViewChild('templateConfirm')
  public TemplateConfirmRef: TemplateRef<any>;

  CitationForm: FormGroup;
  DispositionForm: FormGroup;
  PayForm: FormGroup;
  WaiveModalForm: FormGroup;
  impundReleaseForm: FormGroup;
  FeeDetailsModalForm: FormGroup;
  ReversePaymentModalForm: FormGroup;
  ReleaseToInsuranceForm: FormGroup;
  RemovePlateModalForm: FormGroup;
  TowCompanyId: number;
  UserId: number;
  UserName: string;
  projectFeeMinDate: Date;
  EnterpriseId: number;
  RecordId: string;
  Guid: any;
  indLoading = false;
  isReadonly = false;
  indModalLoading = false;
  ReportingAgencyId: number;
  IsReleased: boolean;
  IsWaived: boolean = false;
  hideTab = false;
  ParentScreen = 'Disposition';
  ReleaseToInsurance = 'ReleaseToInsurance';
  ReleaseToTTI = 'ReleaseToTTI';
  citationSearchData: any;
  private TowDetail: TowModel = new TowModel();
  PageTitle: string;
  IsCheckedRemovePlates: boolean;


  displayedColumns = [
    'description',
    'rate',
    'quantity',
    'taxp',
    'waiveamount',
    'taxamount',
    'subtotal',
    'amount',
    'actions'
  ];

  @ViewChild(MatPaginator)
  paginator: MatPaginator;
  @ViewChild(MatSort)
  sort: MatSort;
  HoldListArray: FormArray;
  CurrentDate: Date;
  Count: number;
  @ViewChild('templateWaive')
  public templateWaiveRef: TemplateRef<any>;
  @ViewChild('templateImpoundRelease')
  public modaltemplateImpoundReleaseRef: BsModalRef;
  public modalConfirmRef: BsModalRef;
  public modaltemplateWaiveRef: BsModalRef;
  public modaltemplateRemovePalteRef: BsModalRef;
  public CompanymodalRef: BsModalRef;

  @ViewChild('templateFeeDetails') modaltemplateFeeDetailsRef: BsModalRef;
  @ViewChild('templateReleaseTo') modaltemplateReleaseToRef: BsModalRef;
  @ViewChild('templateReversePayment') modaltemplateReversePaymentRef: BsModalRef;
  @ViewChild('templateAuditDetails') modaltemplateAuditDetailsRef: BsModalRef;
  @ViewChild('templateAuditPaymentDetails') modaltemplateAuditPaymentDetailsRef: BsModalRef;
  @ViewChild('templateAuditReleaseDetails') modaltemplateAuditReleaseDetailsRef: BsModalRef;
  @ViewChild('templateProjectFee') modaltemplateProjectFeeRef: BsModalRef;
  @ViewChild('templatePermit') modalPermitModalRef: BsModalRef;
  @ViewChild('templateReleaseToInsurance') modalReleaseToInsuranceModalRef: BsModalRef;
  @ViewChild('templateTTIProcess') modalTTIProcessRef: BsModalRef;

  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  waiveReasonList: any = [];
  PaymentHistoryList = [];
  RemovePlatesList = [];
  paymentEligibilityCheckResponse = { IdOut: 0, MessageOut: "0" };
  FeeDetailsList: any = [];
  ReleaseToList: any = [];
  CompanyList: any = [];
  ReleaseToNameList = [];
  ReleaseDetailsList = [];
  FeeList = [];
  AuditDetailsList: any = [];
  AuditPaymentDetailsList: any = [];
  AuditReleaseDetailsList: any = [];
  showNameText = false;
  showOtherWaiveReason = false;
  isAdministrativeRelease = false;
  isTowCompanyRelease = false;
  SelectedTypeList: any = [];
  TotalPaid: any = 0;
  PaymentDue = 0;
  TotalBidAmt: any = 0;
  grandTotal = 0;
  ChangeAmt = 0;
  SelectedRowForPayment: any;
  AuctionDetailsList: any = [];
  SelectedIdsforpayment: any = [];
  IsLocked: boolean;
  ViewAuctionForm: any;
  ReceiptNo: any;
  PaymentTypeList: any = [];
  phonemask: any[] = Global.phonemask;
  StorageFeeId = Global.StorageFeeId;
  ModalName: string;
  ModalType: string;
  DriveModeList = [{ 'ID': '1', 'Name': 'Driven' }, { 'ID': '2', 'Name': 'Towed' }];
  submitted = false;
  noInsuranceSubmitted = false;
  HasRecords = false;
  showErrorMessage = false;
  DocumentPresentFlag: any = 0;
  StorageStatusId: any;
  SLLocationName: string;
  SLLocationNameMessage: string;
  feeRequired = false;
  WaiveErrorMessage: string = "";
  public activetab: number = 0;
  PageId: number;
  RoleId: number;
  ServerTime: any;
  ConnectURL: any;
  CompanyURL: any;
  urlCache = new Map<string, SafeResourceUrl>();
  // DenomForm: FormGroup;
  ProjectFeeForm: FormGroup;
  // DenomTypeList: any[];
  IsCash: boolean;
  // SavedDenomTypeArray: any[];
  // SelectedDenomTypeList: any[];
  DenomCount: number;
  TotalDenomAmt: number;
  DenomForRow: number;
  @ViewChild('templateDenom') public templateDenomRef: TemplateRef<any>;
  // DenomsList: any[];
  // DenomTotalView: number;
  PaymentsList: any[];
  subscription: Subscription;
  totalofCitations = 0;
  totalofPermits = 0;
  totalofDMV = 0;
  totalofTowingFee = 0;
  totalofAP = 0;
  serviceCitationsData: any;
  serviceDMVData: any;
  CIDataList = [];
  DMVDetailsList = [];

  bodyCitations = false;
  bodyPermits = false;
  bodyPayment = false;
  bodyTowStorage = false;
  bodyReleaseCheckList = false;
  bodyPaymentPlan = false;
  bodyDMV = false;
  bodyRefund = false;
  bodyPaymentHistory = true;
  historygridLoader = false;
  removeplatesgridLoader = false;
  bodyDocuments = false;
  bodyAdditionalPayment = false;
  DLMSPath = Global.PoliceURL;
  resUtilService: UtilService
  @ViewChild('checklist', { read: ViewContainerRef }) entry: ViewContainerRef;
  componentRef: any;
  IsOnlinePaid: any = 0;
  OwnerList: any = [];
  HSN: any;
  IsCloverRadioButtonEnable: boolean = false;
  constructor(
    private _dataService: DataService,
    public nav: NavigationService,
    private localStorageService: LocalStorageService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    public sanitizer: DomSanitizer,
    private commService: CommunicationService,
    private el: ElementRef,
    private resolver: ComponentFactoryResolver,
    private utilService: UtilService,
    private spinner: NgxSpinnerService,
    private towService : TowService
  ) {
    this.addScript();
    this.resUtilService = utilService;
    if (this.DispositionForm != null) {
      this.DispositionForm.reset();
    }
    this.createForm();
    var Guid;
    this.activatedRoute.queryParams.subscribe(params => {
      this.PageId = params.PageId;
      this.RoleId = params.RoleId;
      this.DispositionTowId = params.TID;
      this.UserId = params.uid;
      this.UserName = params.UserName;
      this.IsOnlinePaid = params.IsOnlinePaid;
      localStorage.setItem('hsn', params.hsn);
      localStorage.setItem('SessionId', params.sessionId);
      localStorage.setItem('TowId', this.DispositionTowId);
      if (params.ParentScreen) {
        this.ParentScreen = params.ParentScreen;
        if (this.ParentScreen == 'SearchTow') {
          this.bodyTowStorage = true;
          this.bodyCitations = true;
        }
      }
      if (params.Id) {
        Guid = params.Id;
      }
      else {
        Guid = this.localStorageService.get('GUID');
      }

      if (params.ActiveTab) {
        this.activetab = 2;
      }

      const FromPage = params.FromPage;
      this.PageTitle = "Disposition";
      if (!FromPage) {
        this.PageTitle = "Towing/Storage Fees";
      }

      if (this.localStorageService.get('EnterpriseId') != null) {
        this.EnterpriseId = this.localStorageService.get('EnterpriseId');
      }
      if (Guid) {
        this.Guid = Guid;
        this.GetVehicleDetails(this.Guid);
      } else {
        this.TowId = 0;
        this.RecordId = null;

        if (this.DispositionForm != null) {
          this.DispositionForm.reset();
        }
        this.ErrorMsg = '';
        this.SuccessMsg = '';

        this.VehicleRecordId = '';

        if (this.localStorageService.get('EnterpriseId') != null) {
          this.EnterpriseId = this.localStorageService.get('EnterpriseId');
        }
      }
    });

    this.LoadWaiveReason(0);
    this.LoadFeeDropdown(this.DispositionTowId);
    this.LoadGrid(this.DispositionTowId);
    this.getReleaseToInsurance(Number(this.DispositionTowId));
    this.AuditDetails(this.DispositionTowId);
    this.AuditPaymentDetails(this.DispositionTowId);
    this.AuditReleaseDetails(this.DispositionTowId);
    this.PayForm.controls['releasedBy'].disable();
    this.PayForm.controls.releasedBy.setValue(this.UserName);
    this.PayForm.controls['nametxt'].disable();

    this.subscription = this.commService.getCitationsDataDisposition().subscribe(res => {
      if (res) {
        this.serviceCitationsData = res.citations;
        this.totalofCitations = res.citations.totalofCitations;
        if (res.citations.CIData) {
          this.CIDataList = res.citations.CIData;
        } else {
          this.CIDataList = [];
        }

        //this.AddFeeToGrid('Citations', this.serviceCitationsData)
      }
    });

    this.subscription = this.commService.getDMVDataDisposition().subscribe(res => {
      if (res) {
        this.serviceDMVData = res.dmv;
        this.totalofDMV = res.dmv.totalofDMV;
        if (res.dmv.dmvModel) {
          this.DMVDetailsList = res.dmv.dmvModel.DMVDetailsList;
        } else {
          this.DMVDetailsList = [];
        }

        //this.AddFeeToGrid('DMV', this.serviceDMVData)
      }
    });

    this.subscription = this.commService.getAPDataDisposition().subscribe(res => {
      if (res) {
        this.totalofAP = res.ap.totalofAP;
      }
    });

    this.subscription = this.commService.getPaymentCartData().subscribe(res => {
      if (res) {
        if (res.cart.ReceiptNo) {
          this.PaymentHistory(this.DispositionTowId);
          this.RemovePlates(this.DispositionTowId);
        }
      }
    });

    this.subscription = this.commService.getHomeSearchSummeryData().subscribe(res => {
      if (res) {
        this.totalofCitations = res.summeryItem.totalofCitations;
      }
    });
  }

  ngOnInit(): void {
    this.LoadDispositionButtonPermission(this.PageId, this.RoleId);
    if (this.localStorageService.get('EnterpriseId') != null) {
      this.EnterpriseId = this.localStorageService.get('EnterpriseId');
    }
    this.LoaderImage = this.ModalLoaderImage = Global.FullImagePath;
    this.LoadPaymentType();
    this.PaymentReleaseTabGrid();
    this.LoadServerTime();
    this.ConnectURL = Global.PoliceURL + "officer/Tabs/ReleaseCheckListTab.aspx";
    this.CompanyURL = Global.PoliceURL + "/officer/WreckerCompanyDetails.aspx?FromPage=Disposition";
    this.SelectedTowComapny = '';
    this.SelectedTowComapnyid = 0;
    this.LoadOwner();
    this.initCitationForm();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
    localStorage.removeItem('hsn');
   // this.removeScript();
  }

  private createForm() {
    this.DispositionForm = this.fb.group({
      fee: [''],
      FeeListArray: this.fb.array([])
    });

    this.PayForm = this.fb.group({
      PaymentListArray: this.fb.array([]),
      releasedBy: ['', []],
      releaseTo: ['', [Validators.required]],
      releasedDate: ['', []],
      name: [''],
      nametxt: [''],
      address: ['', [Validators.required]],
      dlno: ['', [Validators.required]],
      phone: ['', [Validators.pattern(Global.PHONE_REGEX)]],
      towCompany: [''],
      DriveReleaseMode: new FormControl(null)
    });

    this.WaiveModalForm = this.fb.group({
      desciption: new FormControl(null, Validators.compose([])),
      waiveAmount: new FormControl(null, Validators.compose([Validators.required])),
      waiveReason: new FormControl(null, Validators.compose([Validators.required])),
      waiveTotalamount: new FormControl(null, Validators.compose([])),
      OtherWaiveReason: new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
    });

    this.RemovePlateModalForm = this.fb.group({
      removePlatesFormControl: new FormControl(null, Validators.compose([Validators.required])),
      removePlatesOptionFormControl: new FormControl(''),
      removePlatesInstructionFormControl: new FormControl(null, Validators.compose([Validators.required])),
    });


    this.impundReleaseForm = this.fb.group({
      DriveMode: new FormControl(null, [Validators.required])
    });

    this.ProjectFeeForm = this.fb.group({
      ProjectFeeFormControl: new FormControl(new Date())
    });

    this.ReleaseToInsuranceForm = this.fb.group({
      insuranceCompanyNameFormControl: ['', [Validators.required]],
      NotesFormControl: [''],
      OwnerNameFormControl: ['', [Validators.required]],
      cashierFormControl: [''],
      transactionDateFormControl: [''],
    });
  }

  createItem(Description, Rate, Quantity, Amount, WaiveAmount, SubTotal, Tax, TaxAmount, Total) {
    return this.fb.group({
      Description: new FormControl(Description, [Validators.required]),
      Rate: new FormControl(this.currencyFormat(Rate), [Validators.required, Validators.pattern(Global.PRICE_REGEX)]),
      Quantity: new FormControl(Quantity, [Validators.required, Validators.pattern(Global.QUANTITY_REGEX)]),
      Amount: new FormControl(this.currencyFormat(Amount)),
      WaiveAmount: new FormControl(this.currencyFormat(WaiveAmount)),
      SubTotal: new FormControl(this.currencyFormat(SubTotal)),
      // Tax: new FormControl(Tax),
      // TaxAmount: new FormControl(this.currencyFormat(TaxAmount)),
      Total: new FormControl(this.currencyFormat(Total))
    });
  }

  initHoldItem() {
    return this.fb.group({
      type: new FormControl(),
      amount: new FormControl(),
      checknumber: new FormControl()
    });
  }

  get formData() {
    return <FormArray>this.DispositionForm.get('FeeListArray');
  }

  getIframeConnectURL(): SafeResourceUrl {
    let conurl = this.urlCache.get(this.ConnectURL);
    if (!conurl) {
      conurl = this.sanitizer.bypassSecurityTrustResourceUrl(this.ConnectURL);
      // "https://www.youtube.com/embed/" + videoId + "?enablejsapi=1");;
      this.urlCache.set(this.ConnectURL, conurl);
    }
    return conurl;
  }

  getIframeCompanyURL(): SafeResourceUrl {
    let conurl = this.urlCache.get(this.CompanyURL);
    if (!conurl) {
      conurl = this.sanitizer.bypassSecurityTrustResourceUrl(this.CompanyURL);
      // "https://www.youtube.com/embed/" + videoId + "?enablejsapi=1");;
      this.urlCache.set(this.CompanyURL, conurl);
    }
    return conurl;
  }

  GetVehicleDetails(guid) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectVehicleDetails?GUID=' + guid)
      .subscribe(objTowDetails => {
        // console.log(objTowDetails);

        this.DispositionTowId = objTowDetails[0].TowId;
        this.RecordId = objTowDetails[0].RecordId;
        console.log(this.RecordId);

        this.TowId = parseInt(this.DispositionTowId);
        if (Number(this.TowId) > 0) {
          //this.nav.VehicleStatus = objTowDetails.StorageStatus;
          this.VehicleStatus = objTowDetails[0].StorageStatus;

          this.IsHold = objTowDetails[0].Hold;
          this.PaymentHistory(this.DispositionTowId);
          this.RemovePlates(this.DispositionTowId);
          this.paymentEligibilityCheck(this.DispositionTowId);
          // if (objTowDetails[0].Storage_Status_Id == 3) {
          //   this.VehicleStatus = 'Received';
          // }
          this.StorageStatusId = objTowDetails[0].StoragReStatusId;
          this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetStatusRoleControlList?pageId=' + this.PageId + '&roleId=' + this.RoleId + '&statusId=' + objTowDetails[0].StorageStatusId)
            .subscribe(ButtonPermissionLists => {
              if (ButtonPermissionLists != null) {
                for (var i = 0; i < ButtonPermissionLists.length; i++) {
                  if (ButtonPermissionLists[i]['Control_Name'] == 'Upload') {
                    this.HasUploadPermission = Boolean(ButtonPermissionLists[i]["view_hide"]);
                  } else if (ButtonPermissionLists[i]['Control_Name'] == 'Scan') {
                    this.HasScanPermission = Boolean(ButtonPermissionLists[i]["view_hide"]);
                  }

                }
              }
            },
              error => { this.ErrorMsg = <any>error });

          //this.nav.VehicleRecordId = 'Record Id: ' + objTowDetails.RecordId;
          this.SLLocationName = objTowDetails[0].SLLocationName;
          if (this.SLLocationName == 'EVIDENCE LOT') {
            this.SLLocationNameMessage = Global.EVIDENCELOT_Message;
          }
          else {
            this.SLLocationNameMessage = '';
          }
          this.citationSearchData = {
            'searchType': objTowDetails[0].LicensePlate == '' || objTowDetails[0].LicensePlate == 'No Plate' || objTowDetails[0].LicensePlate == null ? 'C' : 'P',
            'licensePlate': objTowDetails[0].LicensePlate == '' || objTowDetails[0].LicensePlate == 'No Plate' || objTowDetails[0].LicensePlate == null ? '' : objTowDetails[0].LicensePlate,
            'state': objTowDetails[0].LicensePlate == '' || objTowDetails[0].LicensePlate == 'No Plate' || objTowDetails[0].LicensePlate == null ? '' : objTowDetails[0].LicenseState,
            'citationNo': objTowDetails[0].LicensePlate == '' || objTowDetails[0].LicensePlate == 'No Plate' || objTowDetails[0].LicensePlate == null ? objTowDetails[0].CitationNo : '',
            'firstName': '',
            'lastName': ''
          }
        }
        this.DispositionProjectFee = false;
        if (objTowDetails[0].StorageStatusId === 3) {
          this.IsReleased = true;
        }
        else if (objTowDetails[0].StorageStatusId === 2) {
          this.DispositionProjectFee = true;
        }

        this.LoadDispatch(guid);
      });
  }

  initPayFormItem() {
    return this.fb.group({
      PaymentTypeFormControl: new FormControl(''),
      PaymentAmtFormControl: new FormControl(''),
      ChequenoFormControl: new FormControl(''),
      // hdnPaymentAmtFormControl: new FormControl('')
    });
  }

  get PayformData() {
    return <FormArray>this.PayForm.get('PaymentListArray');
  }

  get f() { return this.PayForm.controls; }

  get nif() { return this.ReleaseToInsuranceForm.controls; }

  LoadDocuments() {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetDispositionDocuments?TowingId=' + this.DispositionTowId)
      .subscribe(objTowDetails => {
        if (objTowDetails && objTowDetails.length > 0) {
          this.DocumentPresentFlag = 1;
        }
        else {
          this.DocumentPresentFlag = 0;
        }
      });
  }

  PaymentReleaseTabGrid() {
    const control = <FormArray>this.PayForm.controls['PaymentListArray'];
    control.controls = [];

    control.push(this.initPayFormItem());
    this.Count = control.length;
    this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].setValue(1);

    this.SelectedTypeList.push(1);
    this.changestatus(1, 0);
  }

  /*  LoadTimer() {
     for (let index = 1; index < 24; index++) {
       this.hours.push({ key: index, value: index });
     }
     for (let index = 1; index < 60; index++) {
       this.minutes.push({ key: index, value: index });
     }
   } */

  ReleaseTow() {
    this.ErrorMsg = '';
    this.SuccessMsg = '';
    const objTow: TowReleaseModel = new TowReleaseModel();
    objTow.towingId = this.TowId;
    objTow.RecordId = this.RecordId;

    objTow.ReleaseType = 1;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/ReleaseTow', objTow).subscribe(
      TowCompanyDetails => {
        if (TowCompanyDetails != null && TowCompanyDetails !== '') {
          this._dataService
            .get(Global.DLMS_API_URL + 'api/Disposition/SelectVehicleDetails?GUID=' + this.Guid)
            .subscribe(objTowDetails => {
              this.DispositionTowId = objTowDetails.TowId;

              this.TowId = parseInt(this.DispositionTowId);
              if (Number(this.TowId) > 0) {
                //this.nav.VehicleStatus = objTowDetails.StorageStatus;
                this.VehicleStatus = objTowDetails.StorageStatus;
                this.StorageStatusId = objTowDetails.StorageStatusId;
                //this.nav.VehicleRecordId = 'Record Id: ' + objTowDetails.RecordId;
                if (objTowDetails.Agency == 'California' && objTowDetails.StorageStatus == 'Released') {
                  this.VehicleStatus = 'Received';
                }
              }
              this.SuccessMsg = Global.ReleasedMessage;
              this.IsReleased = true;
            });
        }
      },
      error => (this.ErrorMsg = <any>error)
    );
  }

  /* LoadVehicleType(): void {
    this.VehicleTypes = [];
    this._dataService
      .get(Global.DLMS_API_URL + 'api/Common/GetVehicleType?EnterpriseId=' + this.EnterpriseId)
      .subscribe(
        VTypes => {
          this.VehicleTypes = VTypes;
        },
        error => (this.ErrorMsg = <any>error)
      );
  } */

  SaveTowServices(myForm) {
    const data = {
      TowId: this.TowDetail.TowId,
      VehicleType: myForm.value.stateID,
      WinchingIncrement: myForm.value.agencyID,
      WaitingAtSceneIncrement: myForm.value.caseNumber,
      Mileage: myForm.value.DLNo
    };

    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveTowDetails', data).subscribe(() => { });
  }

  LoadDispatch(Guid: any): void {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetTowId?Guid=' + Guid).subscribe(
      Result => {
        this.TowId = Result.Id;
        // this.LoadTowDetails(this.TowId, -1);
      },
      error => (this.ErrorMsg = <any>error)
    );
  }

  AddNew() {
    // this.ErrorMsg = '';
    // this.SuccessMsg = '';

    // const control = <FormArray>this.DispositionForm.controls['HoldListArray'];
    // this.CurrentDate = new Date();

    // control.push(this.initHoldItem(0, 0, 0, 0));
    // this.Count = control.length;
    // // this.LoadHoldDivision(0);
    // // this.LoadHoldReason(0);
  }

  LoadFeeDropdown(towId) {
    this.indLoading = true;
    this._dataService
      .get(Global.DLMS_API_URL + 'api/Disposition/GetRegularFees?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.FeeTypes = res;
          this.indLoading = false;
        }
      },
        (error) => {
          this.ErrorMsg = <any>error;
          this.indLoading = false;
        });
  }

  LoadGrid(towId): void {
    const control = <FormArray>this.DispositionForm.controls['FeeListArray'];
    control.controls = [];
    this.grandTotal = 0;
    this.totalofTowingFee = 0;
    // tslint:disable-next-line:max-line-length
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetCalulatedFees?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.FeeGrid = res;
          if (this.FeeGrid.length > 0) {
            this.HasRecords = true;
            this.grandTotal = this.PaymentDue = this.TotalBidAmt = this.FeeGrid[0]['GrandTotal'];
            const control = <FormArray>this.DispositionForm.controls['FeeListArray'];
            control.controls = [];
            this.FeeGrid.forEach((element, index) => {
              this.FeeGrid[index]['SectionId'] = 'DispositionFee';
              control.push(this.createItem(
                this.FeeGrid[index]['Description'],
                this.FeeGrid[index]['Rate'],
                this.FeeGrid[index]['Quantity'],
                this.FeeGrid[index]['Amount'],
                this.FeeGrid[index]['WaiveAmount'],
                this.FeeGrid[index]['SubTotal'],
                this.FeeGrid[index]['Tax'],
                this.FeeGrid[index]['TaxAmount'],
                this.FeeGrid[index]['Total']
              ));

              if (element.ChargeId !== 0) {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].disable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].disable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].disable();
                // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].disable();
                if (element.CategoryId > 1 && element.Variable == 1) {
                  this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
                }

                if (element.CategoryId > 1 && element.Editable == 1) {
                  this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
                  this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
                }


              } else {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].enable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
                // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].enable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
              }
              // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].disable();
              // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].disable();
              // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].disable();
              // if (element.Variable === true) {
              //   this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
              // } else {
              //   this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].disable();
              // }
              // this.SelectReleaseToInsurance ||
              if (this.VehicleStatus == 'Released' || this.VehicleStatus == 'Received') {
                this.totalofTowingFee += Number(this.FeeGrid[index]['Total']);
              }
              else {
                this.totalofTowingFee = 0;
              }
            });
            this.sendTowAndStorageFee();
          } else {
            this.FeeGrid = [];
          }
        } else {
          this.FeeGrid = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  GetRegularFeeDetails(feeId, towId): void {
    // tslint:disable-next-line:max-line-length
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetRegularFeeDetails?FeeId=' + feeId + '&TowingId=' + towId)
      .subscribe(res => {
        if (res && res.length > 0) {
          if ((res[0].Fee == null || res[0].Fee == 0) && res[0].CategoryId != 5) {
            this.ErrorMsg = 'Please configure rate for the selected fee type. Fees with no rate configured cannot be added.';
            this.indLoading = false;
            return;
          }

          const resp = res[0];
          const isFound = this.FeeGrid.find(x => String(x.Description).toLowerCase() == String(resp.FeeName).toLowerCase());
          if (isFound) {
            this.ErrorMsg = 'Fee already exist';
          }
          else {
            this.ErrorMsg = null;
            const obj = {
              'SectionId': 'DispositionFee',
              'TowFeesId': 0,
              'FeeXREFId': resp.Id,
              'CategoryId': 2,
              'Editable': resp.Editable,
              'Variable': resp.Variable,
              'WaiveReasonId': null,
              'OtherWaiveReason': null,
              'TowId': this.DispositionTowId,
              'ChargeId': feeId,
              'Description': resp.FeeName,
              'Rate': resp.Fee,
              'Quantity': 1,
              'Amount': resp.Fee * 1, // Rate * Qty
              'WaiveAmount': 0,
              'SubTotal': (resp.Fee * 1) - 0,
              'Tax': resp.TaxRate,
              'TaxAmount': (resp.Fee * 1) * (resp.TaxRate / 100),
              'Total': (resp.Fee * 1) + ((resp.Fee * 1) * (resp.TaxRate / 100)), // Sub Total + TaxAmount
              'GrandTotal': (resp.Fee * 1) + ((resp.Fee * 1) * (resp.TaxRate / 100))
            };
            this.FeeGrid.push(obj);
          }
        } else {
          this.ErrorMsg = null;
          const obj = {
            'SectionId': 'DispositionFee',
            'TowFeesId': 0,
            'FeeXREFId': null,
            'CategoryId': null,
            'Editable': null,
            'Variable': null,
            'WaiveReasonId': null,
            'OtherWaiveReason': null,
            'TowId': this.DispositionTowId,
            'ChargeId': feeId,
            'Description': null,
            'Rate': 0,
            'Quantity': 1,
            'Amount': 0,
            'WaiveAmount': 0,
            'SubTotal': 0,
            'Tax': 0,
            'TaxAmount': 0,
            'Total': 0,
            'GrandTotal': 0
          };
          this.FeeGrid.push(obj);
        }

        if (this.FeeGrid.length > 0) {
          const control = <FormArray>this.DispositionForm.controls['FeeListArray'];
          this.HasRecords = true;
          control.controls = [];
          this.FeeGrid.forEach((item, index) => {
            control.push(this.createItem(
              this.FeeGrid[index]['Description'],
              this.FeeGrid[index]['Rate'],
              this.FeeGrid[index]['Quantity'],
              this.FeeGrid[index]['Amount'],
              this.FeeGrid[index]['WaiveAmount'],
              this.FeeGrid[index]['SubTotal'],
              this.FeeGrid[index]['Tax'],
              this.FeeGrid[index]['TaxAmount'],
              this.FeeGrid[index]['Total']
            ));

            if (item.ChargeId !== 0) {
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].disable();
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].disable();
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].disable();
              // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].disable();
              if (item.CategoryId == 2 && item.Variable == 1) {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
              }

              if (item.CategoryId == 2 && item.Editable == 1) {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
              }

              /* if (this.FeeGrid[index]['Description'] == 'Tow Fee-Heavy Duty') {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
              } */

            } else {
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].enable();
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
              // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].enable();
              this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();

              /* if (this.FeeGrid[index]['Description'] == 'Tow Fee-Heavy Duty') {
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
                this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
              } */
            }
          });
          this.sendTowAndStorageFee();

          this.SaveAllFees();
        }
        this.indLoading = false;
      },
        (error) => {
          this.ErrorMsg = <any>error;
          this.indLoading = false;
        });
  }

  feeChange(ev) {
    this.GetRegularFeeDetails(ev.value, this.DispositionTowId);
  }
  SaveRemovePlates() {
    this.indLoading = true;
    const ObjA: RemovePlateEntity = new RemovePlateEntity();
    ObjA.UserId = this.UserId;
    ObjA.TowId = Number(this.DispositionTowId);
    ObjA.RemovePlate = this.RemovePlateModalForm.controls.removePlatesFormControl.value;
    if( ObjA.RemovePlate == true)
    {
      ObjA.RemovePlateOption = this.RemovePlateModalForm.controls.removePlatesOptionFormControl.value;
    }
    else
    {
      ObjA.RemovePlateOption = null;
    }   
    ObjA.RemovePlateInstruction = this.RemovePlateModalForm.controls.removePlatesInstructionFormControl.value;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/UpdateRemovePlate', ObjA)
    .subscribe(result => {
      if (result.Id > 0) {       
        this.closeRemovePalteRef();
        this.SuccessMsg = Global.SaveMessage;
        this.indLoading = false;    
      } else {        
        this.RemovePlateErrorMsg = result.Result;
        this.indLoading = false;
      }
    }, error => {     
      this.indLoading = false;
      this.RemovePlateErrorMsg = <any>error;
    });

  }

  SaveWaive() {
    const waivetotalamount = this.replaceDollar(this.WaiveModalForm.controls.waiveTotalamount.value);
    const waiveamount = this.replaceDollar(this.WaiveModalForm.controls['waiveAmount'].value);

    const i = this.DeleteIndex;
    if (this.WaiveModalForm.invalid || this.showErrorMessage) {
      this.validateAllFormFields(this.WaiveModalForm);
      return;
    }
    else {
      if (<number>this.replaceDollar(this.WaiveModalForm.controls['waiveAmount'].value) <= 0) {
        this.showErrorMessage = true;
        this.WaiveErrorMessage = "Enter a valid Waive Amount";
        this.validateAllFormFields(this.WaiveModalForm);
        return;
      }

      if (Number(waiveamount) > Number(waivetotalamount)) {
        this.showErrorMessage = true;
        this.WaiveErrorMessage = "Waive Amount can't be greater than Amount";
        return;
      }
    }

    this.indLoading = true;
    const ObjA: SaveFeeModel = new SaveFeeModel();

    ObjA.TowFeesId = this.FeeGrid[i]['TowFeesId'];
    ObjA.TowId = parseInt(this.DispositionTowId);
    ObjA.ChargeId = this.FeeGrid[i]['ChargeId'];
    ObjA.Description = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value;
    ObjA.Rate = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value);
    ObjA.Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
    ObjA.Amount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].value);

    ObjA.WaiveAmount = this.replaceDollar(this.WaiveModalForm.controls.waiveAmount.value);
    ObjA.WaiveReasonId = this.WaiveModalForm.controls.waiveReason.value;
    ObjA.OtherWaiveReason = this.WaiveModalForm.controls.OtherWaiveReason.value;
    ObjA.Tax = 0;//this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;

    const SubTotal = Number(ObjA.Amount) - Number(ObjA.WaiveAmount);
    const TaxP = 0; //Number(ObjA.Tax) / 100;
    const TaxAmount = 0; //Number(SubTotal) * Number(TaxP);
    const Total = Number(SubTotal) + Number(TaxAmount);

    ObjA.TaxAmount = TaxAmount;//this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['TaxAmount'].value);
    ObjA.SubTotal = SubTotal;//this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['SubTotal'].value);
    ObjA.Total = Total;// this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Total'].value);
    ObjA.PaidId = null;
    ObjA.DisplayNo = null;
    ObjA.DeleteFlag = 0;
    ObjA.FeeXREFId = this.FeeGrid[i]['FeeXREFId'];
    ObjA.UserId = this.UserId;

    ObjA.CategoryId = this.FeeGrid[i]['CategoryId'];
    ObjA.GuId = this.Guid;
    this.FeeList.push(ObjA);

    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveReleaseFees', this.FeeList)
      .subscribe(result => {
        if (result.Id > 0) {
          this.FeeList = [];
          this.LoadGrid(this.DispositionTowId);
          this.closeWaiveRef();
          this.SuccessMsg = Global.SaveMessage;
          this.indLoading = false;
          this.IsWaived = true;
        } else {
          this.FeeList = [];
          this.WaiveErrorMsg = result.Result;
          this.indLoading = false;
        }
      }, error => {
        this.FeeList = [];
        this.indLoading = false;
        this.WaiveErrorMsg = <any>error;
      });
  }

  RevertWaive() {
    const i = this.DeleteIndex;

    this.indLoading = true;
    const ObjA: SaveFeeModel = new SaveFeeModel();

    ObjA.TowFeesId = this.FeeGrid[i]['TowFeesId'];
    ObjA.TowId = parseInt(this.DispositionTowId);
    ObjA.ChargeId = this.FeeGrid[i]['ChargeId'];
    ObjA.Description = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value;
    ObjA.Rate = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value);
    ObjA.Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
    ObjA.Amount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].value);

    ObjA.WaiveAmount = 0;
    ObjA.WaiveReasonId = null;
    ObjA.OtherWaiveReason = null;
    ObjA.Tax = 0; //this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;

    const SubTotal = Number(ObjA.Amount);
    const TaxP = 0; //Number(ObjA.Tax) / 100;
    const TaxAmount = 0; //Number(SubTotal) * Number(TaxP);
    const Total = Number(SubTotal) + Number(TaxAmount);

    ObjA.TaxAmount = TaxAmount;
    ObjA.SubTotal = SubTotal;
    ObjA.Total = Total;
    ObjA.PaidId = null;
    ObjA.DisplayNo = null;
    ObjA.DeleteFlag = 0;
    ObjA.FeeXREFId = this.FeeGrid[i]['FeeXREFId'];
    ObjA.UserId = this.UserId;

    ObjA.CategoryId = this.FeeGrid[i]['CategoryId'];
    ObjA.GuId = this.Guid;
    this.FeeList.push(ObjA);

    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveReleaseFees', this.FeeList)
      .subscribe(result => {
        if (result.Id > 0) {
          this.FeeList = [];
          this.LoadGrid(this.DispositionTowId);
          this.closeWaiveRef();
          this.SuccessMsg = Global.SaveMessage;
          this.indLoading = false;
          this.IsWaived = false;
        } else {
          this.FeeList = [];
          this.WaiveErrorMsg = result.Result;
          this.indLoading = false;
        }
      }, error => {
        this.FeeList = [];
        this.indLoading = false;
        this.WaiveErrorMsg = <any>error;
      });
  }

  onWaiveReasonChange(ev) {
    const option = ev.source.triggerValue;
    switch (option) {
      case 'Other':
        this.showOtherWaiveReason = true;
        this.WaiveModalForm.controls['OtherWaiveReason'].enable();
        break;
      default:
        this.WaiveModalForm.controls['OtherWaiveReason'].setValue(null);
        this.showOtherWaiveReason = false;
        this.WaiveModalForm.controls['OtherWaiveReason'].disable();
        break;
    }
  }

  SaveImpoundRelease() {
    if (this.impundReleaseForm.invalid) {
      this.validateAllFormFields(this.impundReleaseForm);
      return;
    }
    this.indModalLoading = true;
    const obj: SaveImpoundReleaseModel = new SaveImpoundReleaseModel();
    obj.TowId = parseInt(this.DispositionTowId);
    obj.DriveMode = 0;//this.impundReleaseForm.controls.DriveMode.value;
    obj.ImpoundReleasedBy = this.UserId;
    obj.ImpoundReleasedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd hh:mm');
    obj.StorageStatusId = 4;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveTowImpoundReleaseDetails', obj)
      .subscribe(result => {
        if (result.Id > 0) {
          this.indModalLoading = false;
          this.closeImpoundReleaseRef();
          this.SuccessMsg = Global.SaveMessage;
          this.GetVehicleDetails(this.Guid);
          window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Impound";

        } else {
          this.ImpoundReleaseErrorMsg = result.Result;
          this.indModalLoading = false;
        }
      }, error => {
        this.indModalLoading = false;
        this.ImpoundReleaseErrorMsg = <any>error;
      });
  }

  SaveImpoundReleaseDirect() {
    // // if (this.impundReleaseForm.invalid) {
    // //   this.validateAllFormFields(this.impundReleaseForm);
    // //   return;
    // // }
    this.indModalLoading = true;
    const obj: SaveImpoundReleaseModel = new SaveImpoundReleaseModel();
    obj.TowId = parseInt(this.DispositionTowId);
    obj.DriveMode = 0;// this.PayForm.controls.DriveReleaseMode.value;
    obj.ImpoundReleasedBy = this.UserId;
    obj.ImpoundReleasedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd hh:mm');
    obj.StorageStatusId = 4;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveTowImpoundReleaseDetails', obj)
      .subscribe(result => {
        if (result.Id > 0) {
          this.indModalLoading = false;
          // this.closeImpoundReleaseRef();
          // if (this.DocumentPresentFlag == 1) {
          this.SuccessMsg = Global.SaveMessage;
          // }
          // else {
          //   this.SuccessMsg = "You are releasing the vehicle without uploading any document.";
          // }
          // this.GetVehicleDetails(this.Guid);

          // ******************    Print the receipt

          this.indLoading = true;
          this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectPaidSummary?TowId=' + this.DispositionTowId)
            .subscribe(res => {
              this.indLoading = false;
              if (res) {
                if (res[0].ReleasedTo == 'A' || res[0].ReleasedTo == 'M') {
                  window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + res[0].PaidId, '_blank');
                  window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Impound";
                } else {
                  window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + res[0].PaidId, '_blank');
                  window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Impound";
                }
              }
            }, error => {
              this.indLoading = false;
              this.ErrorMsg = <any>error;
            });
        } else {
          this.ImpoundReleaseErrorMsg = result.Result;
          this.indModalLoading = false;
        }
      }, error => {
        this.indModalLoading = false;
        this.ImpoundReleaseErrorMsg = <any>error;
      });
  }

  OpenConfirm(template: TemplateRef<any>, index: number) {
    this.ClearMsg();
    this.ModalName = 'Confirm Remove Fee';
    this.ConfirmMessage = Global.RemoveConfirmationMessage;
    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);


    this.DeleteIndex = index;
    this.ModalType = 'delete';
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  OpenConfirmPayment(template: TemplateRef<any>, index: number) {
    this.ModalName = 'Payment';
    this.ConfirmMessage = "You are releasing the vehicle without uploading any document.";
    // setTimeout(() => {
    //   document.getElementById('okconfirmele').focus();
    // }, 100);
    this.ModalType = 'Payment';
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  DeleteSingleFeeRow(i) {
    this.indLoading = true;
    if (parseInt(this.FeeGrid[i]['TowFeesId']) == 0) {
      this.FeeList.splice(i, 1);
      this.FeeGrid.splice(i, 1);
      const control = <FormArray>this.DispositionForm.controls['FeeListArray'];
      control.controls.splice(i, 1);
      this.indLoading = false;
      this.CancelConfirm();
      this.SuccessMsg = Global.DeleteMessage;
    }
    else {
      const ObjA: SaveFeeModel = new SaveFeeModel();
      ObjA.TowFeesId = this.FeeGrid[i]['TowFeesId'];
      ObjA.TowId = parseInt(this.DispositionTowId);
      ObjA.ChargeId = this.FeeGrid[i]['ChargeId'];
      ObjA.Description = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value;
      ObjA.Rate = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value);
      ObjA.Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
      ObjA.Amount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].value);
      ObjA.Tax = 0; //this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;
      ObjA.TaxAmount = 0; //this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['TaxAmount'].value);
      ObjA.WaiveAmount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['WaiveAmount'].value);

      ObjA.DeleteFlag = 1;
      ObjA.FeeXREFId = this.FeeGrid[i]['FeeXREFId'];
      ObjA.UserId = this.UserId;

      ObjA.CategoryId = this.FeeGrid[i]['CategoryId'];
      ObjA.GuId = this.Guid;

      this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/DeleteTowReleaseFee', ObjA).subscribe(result => {
        if (result.Id > 0) {
          this.CancelConfirm();
          this.SuccessMsg = Global.DeleteMessage;
          this.indLoading = false;
          this.LoadGrid(this.DispositionTowId);
        } else {
          this.ErrorMsg = result.Result;
          this.indLoading = false;
        }
      }, error => {
        this.indLoading = false;
        this.FeeList = [];
        this.ErrorMsg = <any>error;
      });
    }
    if (this.FeeGrid.length > 0) {
      this.grandTotal = 0;
      this.totalofTowingFee = 0;
      this.totalofDMV = 0;
      this.totalofCitations = 0;
      this.FeeGrid.forEach((item, index) => {
        this.grandTotal += Number(this.FeeGrid[index]['Total']);
        if (this.FeeGrid[index]['SectionId'] == 'DispositionFee') {
          // this.SelectReleaseToInsurance ||
          if (this.VehicleStatus == 'Released' || this.VehicleStatus == 'Received') {
            this.totalofTowingFee += Number(this.FeeGrid[index]['Total']);
          }
          else {
            this.totalofTowingFee = 0;
          }
        }
        if (this.FeeGrid[index]['SectionId'] == 'Citations') {
          this.totalofCitations += Number(this.FeeGrid[index]['Total']);
        }
        if (this.FeeGrid[index]['SectionId'] == 'DMV') {
          this.totalofDMV += Number(this.FeeGrid[index]['Total']);
        }
      });
    }
  }

  ReversePayment(i) {
    this.indLoading = true;
    const obj: ReverseTowReleaseModel = new ReverseTowReleaseModel();
    obj.PaidId = this.PaymentHistoryList[i]['PaymentId'];
    obj.TowId = parseInt(this.DispositionTowId);
    obj.UserId = this.UserId;
    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/ReverseTowReleasePayment', obj).subscribe(result => {
      if (result.Id > 0) {
        this.CancelConfirm();
        this.SuccessMsg = Global.ReversePaymentSuccessMessage;
        this.indLoading = false;
        this.GetVehicleDetails(this.Guid);
        this.LoadGrid(this.DispositionTowId);
        this.PaymentReleaseTabGrid();

        this.PaymentHistory(this.DispositionTowId);
        this.RemovePlates(this.DispositionTowId);
        // this.PayForm.controls.releasedDate.setValue(this.datePipe.transform(new Date(), 'MM/dd/yyyy hh:mm a'));
        this.LoadServerTime();
        this.PayForm.controls.releaseTo.setValue('');
        this.PayForm.controls.releaseTo.reset();
        this.PayForm.controls.name.setValue('');
        this.PayForm.controls.name.reset();
        this.PayForm.controls.nametxt.setValue('');
        this.PayForm.controls.nametxt.reset();
        this.PayForm.controls.address.setValue('');
        this.PayForm.controls.address.reset();
        this.PayForm.controls.dlno.setValue('');
        this.PayForm.controls.dlno.reset();
        this.PayForm.controls.phone.setValue('');
        this.ReceiptNo = '';
        this.ChangeAmt = 0;
        this.isAdministrativeRelease = false;
        this.isTowCompanyRelease = false;

        window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Reverse";
      } else {
        this.ErrorMsg = result.Result;
        this.indLoading = false;
      }
    }, error => {
      this.indLoading = false;
      this.ErrorMsg = <any>error;
    });
  }

  ClearMsg() {
    this.SuccessMsg = this.ErrorMsg = this.DeleteErrorMsg = '';
  }

  OkConfirm(index: number) {
    this.ClearMsg();
    switch (this.ModalType) {
      case 'delete':
        this.DeleteSingleFeeRow(index);
        break;
      case 'reversepayment':
        this.ReversePayment(index);
        break;
      case 'Payment':
        this.SavePayment();
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

  SaveSingleFeeRow(obj, i) {
    this.ClearMsg();
    this.feeRequired = false;
    if (this.DispositionForm.invalid) {
      this.validateAllFormFields(this.DispositionForm);
      return;
    }

    if (this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value) <= 0) {
      this.ErrorMsg = "Please Enter a valid Rate";
      return;
    }

    this.indLoading = true;
    const index = this.FeeList.findIndex(
      x => x.Description === this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value
    );
    if (index === 0) {
      // this.FeeList.shift();
    } else {
      this.FeeList.splice(index);
    }
    const ObjA: SaveFeeModel = new SaveFeeModel();
    ObjA.TowFeesId = this.FeeGrid[i]['TowFeesId'];
    ObjA.TowId = parseInt(this.DispositionTowId);
    ObjA.ChargeId = this.FeeGrid[i]['ChargeId'];
    ObjA.Description = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value;
    ObjA.Rate = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value);
    ObjA.Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
    ObjA.Amount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].value);
    ObjA.Tax = 0; //this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;
    ObjA.TaxAmount = 0; //this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['TaxAmount'].value);
    ObjA.WaiveAmount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['WaiveAmount'].value);
    if (this.FeeGrid[i]['WaiveReasonId']) {
      ObjA.WaiveReasonId = this.FeeGrid[i]['WaiveReasonId'];
    } else {
      ObjA.WaiveReasonId = null;
    }
    ObjA.OtherWaiveReason = this.FeeGrid[i]['OtherWaiveReason'];
    ObjA.SubTotal = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['SubTotal'].value);
    ObjA.Total = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Total'].value);
    ObjA.PaidId = null;
    ObjA.DisplayNo = null;
    ObjA.DeleteFlag = 0;
    ObjA.FeeXREFId = this.FeeGrid[i]['FeeXREFId'];
    ObjA.UserId = this.UserId;

    ObjA.CategoryId = this.FeeGrid[i]['CategoryId'];
    ObjA.GuId = this.Guid;
    this.FeeList.push(ObjA);

    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveReleaseFees', this.FeeList)
      .subscribe(result => {
        if (result.Id > 0) {
          this.FeeList = [];
          this.SuccessMsg = Global.SaveMessage;
          this.indLoading = false;
          this.LoadGrid(this.DispositionTowId);
        } else {
          this.FeeList = [];
          this.ErrorMsg = result.Result;
          this.indLoading = false;
        }
      }, error => {
        this.indLoading = false;
        this.FeeList = [];
        this.ErrorMsg = <any>error;
      });
  }

  SaveAllFees() {
    this.ClearMsg();
    this.feeRequired = false;
    if (this.DispositionForm.valid) {
      this.indLoading = true;
      for (let i = 0; i < this.FeeGrid.length; i++) {
        if (this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value) <= 0) {
          this.ErrorMsg = "Please Enter a valid Rate";
          this.indLoading = false;
          return;
        }

        const ObjA: SaveFeeModel = new SaveFeeModel();
        ObjA.TowFeesId = this.FeeGrid[i]['TowFeesId'];
        ObjA.TowId = parseInt(this.DispositionTowId);
        ObjA.ChargeId = this.FeeGrid[i]['ChargeId'];
        ObjA.Description = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Description'].value;
        ObjA.Rate = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value);
        ObjA.Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
        ObjA.Amount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].value);
        ObjA.Tax = 0; //this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;
        ObjA.TaxAmount = 0; //this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['TaxAmount'].value);
        ObjA.WaiveAmount = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['WaiveAmount'].value);
        if (this.FeeGrid[i]['WaiveReasonId']) {
          ObjA.WaiveReasonId = this.FeeGrid[i]['WaiveReasonId'];
        } else {
          ObjA.WaiveReasonId = null;
        }
        ObjA.OtherWaiveReason = this.FeeGrid[i]['OtherWaiveReason'];
        ObjA.SubTotal = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['SubTotal'].value);
        ObjA.Total = this.replaceDollar(this.DispositionForm.controls.FeeListArray['controls'][i].controls['Total'].value);
        ObjA.PaidId = null;
        ObjA.DisplayNo = null;
        ObjA.DeleteFlag = 0;
        ObjA.FeeXREFId = this.FeeGrid[i]['FeeXREFId'];
        ObjA.UserId = this.UserId;

        ObjA.CategoryId = this.FeeGrid[i]['CategoryId'];
        ObjA.GuId = this.Guid;
        this.FeeList.push(ObjA);
      }

      if (this.FeeList.length > 0) {
        this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveReleaseFees', this.FeeList)
          .subscribe(result => {
            if (result.Id > 0) {
              this.SuccessMsg = Global.SaveMessage;
              this.LoadGrid(this.DispositionTowId);
              this.indLoading = false;
              this.FeeList = [];
              this.AuditDetails(this.DispositionTowId);
            } else {
              this.FeeList = [];
              this.ErrorMsg = result.Result;
              this.indLoading = false;
            }
          }, error => {
            this.FeeList = [];
            this.indLoading = false;
            this.ErrorMsg = <any>error;
          });
      }
    }
    else {
      this.validateAllFormFields(this.DispositionForm);
    }
  }

  calculate(field, i) {
    const Quantity = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Quantity'].value;
    const Rate = this.DispositionForm.controls.FeeListArray['controls'][i].controls['Rate'].value;
    const Amount = Number(Quantity) * Number(this.replaceDollar(Rate));
    const waiveAmount = this.DispositionForm.controls.FeeListArray['controls'][i].controls['WaiveAmount'].value;
    const SubTotal = Number(Amount) - Number(this.replaceDollar(waiveAmount));

    const Tax = 0; //this.DispositionForm.controls.FeeListArray['controls'][i].controls['Tax'].value;
    const TaxP = 0; //Number(Tax) / 100;

    const TaxAmount = Number(SubTotal) * Number(TaxP);
    const Total = Number(SubTotal) + Number(TaxAmount);

    this.DispositionForm.controls.FeeListArray['controls'][i].controls['Amount'].setValue(this.currencyFormat(Amount));
    this.DispositionForm.controls.FeeListArray['controls'][i].controls['Total'].setValue(this.currencyFormat(Total));
    this.DispositionForm.controls.FeeListArray['controls'][i].controls['SubTotal'].setValue(this.currencyFormat(SubTotal));
  }

  replaceDollar(amount) {
    if (amount) {
      return amount.replace('$', '').replace(',', '');
    } else {
      return 0;
    }
  }

  currencyFormat(amount) {
    if (amount) {
      return this.currencyPipe.transform(amount);
    } else {
      return this.currencyPipe.transform(0);
    }
  }

  LoadWaiveReason(reasonId) {
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetWaiveReason?ReasonId=' + reasonId)
      .subscribe(res => {
        this.indLoading = false;
        this.waiveReasonList = res;
      }, error => {
        this.indLoading = false;
        this.ErrorMsg = <any>error;
      });
  }

  PaymentHistory(towId) {
    this.historygridLoader = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectPaidSummary?TowId=' + towId)
      .subscribe(res => {
        this.historygridLoader = false;
        if (res) {
          this.PaymentHistoryList = res;
        } else {
          this.PaymentHistoryList = [];
        }
      }, error => {
        this.historygridLoader = false;
        this.ErrorMsg = <any>error;
      });
  }

  RemovePlates(towId) {
    this.removeplatesgridLoader = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectRemovePlatesDetails?TowId=' + towId)
      .subscribe(res => {
        this.historygridLoader = false;
        if (res) {
          this.RemovePlatesList = res;
        } else {
          this.RemovePlatesList = [];
        }
      }, error => {
        this.removeplatesgridLoader = false;
        this.ErrorMsg = <any>error;
      });
  }

  // LoadReleaseTo() {
  //   this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseTo')
  //     .subscribe(res => {
  //       if (res) {
  //         this.ReleaseToList = res;
  //       } else {
  //         this.ReleaseToList = [];
  //       }
  //     },
  //       error => (this.ErrorMsg = <any>error));
  // }

  // LoadCompany() {
  //   this._dataService.get(Global.DLMS_API_URL + 'api/TowCompany')
  //     .subscribe(res => {
  //       if (res) {
  //         this.CompanyList = res;
  //       } else {
  //         this.CompanyList = [];
  //       }
  //     },
  //       error => (this.ErrorMsg = <any>error));
  // }

  filterCompanies(val: any) {
    return val ? this.CompanyList.filter(s => s.TowCompanyName.toLowerCase().indexOf(val.toLowerCase()) == 0)
      : this.CompanyList;
  }

  displayFnCompany(copmany): string {
    return copmany ? copmany.TowCompanyName : copmany;
  }

  private ReleaseType(Id) {
    if (Id === 1) {
      return 'O';
    } else if (Id === 2) {
      return 'L';
    } else if (Id === 3) {
      return 'I';
    } else if (Id === 4) {
      return 'R';
    } else if (Id === 7) {
      return 'T';
    } else if (Id === 5) {
      return 'A';
    } else {
      return 'M';
    }
  }

  onTowCompanyChange(ev) {
    var val = ev.value;
    this.PayForm.controls['address'].setValue(val.CompleteAddress);
    this.SelectedTowComapnyid = val.TowCompanyId;
    this.SelectedTowComapny = val.TowCompanyName;

  }

  onReleaseToChange(ev) {
    this.showNameText = false;
    this.PayForm.controls['address'].setValue('', { onlySelf: true });
    const option = ev.source.triggerValue;
    this.PayForm.controls.nametxt.setValue(null);
    this.PayForm.controls['nametxt'].clearValidators();
    this.PayForm.controls['name'].clearValidators();
    this.PayForm.controls['towCompany'].clearValidators();
    this.PayForm.controls['nametxt'].updateValueAndValidity();
    this.PayForm.controls['name'].updateValueAndValidity();
    this.PayForm.controls['towCompany'].updateValueAndValidity();
    this.PayForm.controls['towCompany'].setValue(null, { onlySelf: true });
    switch (option) {

      case 'Insurance':
        this.showNameText = true;
        if ((<number>this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].value.length) === 0) {
          this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].setValue(2, { onlySelf: true });
        }

        this.isAdministrativeRelease = false;
        this.isTowCompanyRelease = false;
        this.enableDisableControles(true);

        this.PayForm.controls['nametxt'].setValidators([Validators.required]);
        this.PayForm.controls['name'].clearValidators();
        this.PayForm.controls['nametxt'].updateValueAndValidity();
        this.PayForm.controls['name'].updateValueAndValidity();
        this.PayForm.controls['dlno'].clearValidators();
        this.PayForm.controls['dlno'].updateValueAndValidity();
        break;
      case 'Administrative Release':
      case 'Release to MPD':
        this.SelectedTypeList = [];
        this.PaymentReleaseTabGrid();
        this.isAdministrativeRelease = true;
        this.enableDisableControles(false);

        break;
      case 'Tow Company':
        this.isTowCompanyRelease = true;
        this.PayForm.controls['towCompany'].setValidators([Validators.required]);
        this.PayForm.controls['towCompany'].updateValueAndValidity();
        this.PayForm.controls['dlno'].clearValidators();
        this.PayForm.controls['dlno'].updateValueAndValidity();
        break;
      case 'Lien':
        this.showNameText = false;
        if ((<number>this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].value.length) === 0) {
          this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].setValue(2, { onlySelf: true });
        }

        this.isAdministrativeRelease = false;
        this.isTowCompanyRelease = false;
        this.enableDisableControles(true);
        this.PayForm.controls['towCompany'].setValue(0, { onlySelf: true });
        this.PayForm.controls['name'].setValidators([Validators.required]);
        this.PayForm.controls['nametxt'].clearValidators();
        this.PayForm.controls['nametxt'].updateValueAndValidity();
        this.PayForm.controls['name'].updateValueAndValidity();
        this.PayForm.controls['dlno'].clearValidators();
        this.PayForm.controls['dlno'].updateValueAndValidity();

        break;
      case 'Other':
        this.PayForm.controls['dlno'].setValidators([Validators.required]);
        this.PayForm.controls['dlno'].updateValueAndValidity();
        this.showNameText = true;
        this.enableDisableControles(true);
        break;
      default:
        if ((<number>this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].value.length) === 0) {
          this.PayForm.controls.PaymentListArray['controls'][0].controls['PaymentTypeFormControl'].setValue(2, { onlySelf: true });
        }

        this.isAdministrativeRelease = false;
        this.isTowCompanyRelease = false;
        this.enableDisableControles(true);
        this.PayForm.controls['towCompany'].setValue(0, { onlySelf: true });
        this.PayForm.controls['name'].setValidators([Validators.required]);
        this.PayForm.controls['nametxt'].clearValidators();
        this.PayForm.controls['nametxt'].updateValueAndValidity();
        this.PayForm.controls['name'].updateValueAndValidity();
        this.PayForm.controls['dlno'].setValidators([Validators.required]);
        this.PayForm.controls['dlno'].updateValueAndValidity();
        break;
    }
    this.ReleaseToName(this.DispositionTowId, this.ReleaseType(ev.value));
  }

  ReleaseToName(towId, type) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToName?TowId=' + towId + '&Type=' + type)
      .subscribe(res => {
        if (res && res.length > 0) {
          this.ReleaseToNameList = res;
          this.PayForm.controls.name.setValue(this.ReleaseToNameList[0].Id);
          this.PayForm.controls.address.setValue(this.ReleaseToNameList[0].Address);
        } else {
          this.ReleaseToNameList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  onNameChange(event) {
    const i = this.ReleaseToNameList.findIndex(k => k.Id === event.value);
    this.PayForm.controls.address.setValue(this.ReleaseToNameList[i].Address);
  }

  enableDisableControles(status: boolean) {
    if (status) {
      this.PayForm.controls['name'].enable();
      this.PayForm.controls['name'].setValue('');
      this.PayForm.controls['nametxt'].enable();
      this.PayForm.controls['dlno'].enable();
      this.PayForm.controls['phone'].enable();
      this.PayForm.controls['address'].enable();
      const control = <FormArray>this.PayForm.controls['PaymentListArray'];
      for (let c = 0; c < control.length; c++) {
        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentTypeFormControl'].enable();
        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].enable();
        // this.PayForm.controls.PaymentListArray['controls'][c].controls['ChequenoFormControl'].disable();
      }
    } else {
      this.PayForm.controls['name'].disable();
      this.PayForm.controls['nametxt'].disable();
      this.PayForm.controls['dlno'].disable();
      this.PayForm.controls['phone'].disable();
      this.PayForm.controls['address'].disable();

      const control = <FormArray>this.PayForm.controls['PaymentListArray'];
      for (let c = 0; c < control.length; c++) {
        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentTypeFormControl'].disable();
        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].disable();
        this.PayForm.controls.PaymentListArray['controls'][c].controls['ChequenoFormControl'].disable();

        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentTypeFormControl'].setValue([]);
        this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].setValue(null);
        this.PayForm.controls.PaymentListArray['controls'][c].controls['ChequenoFormControl'].setValue(null);
      }

      this.PayForm.controls['name'].reset();
      this.PayForm.controls['nametxt'].reset();
      this.PayForm.controls['address'].reset();
      this.PayForm.controls['dlno'].reset();
      this.PayForm.controls['phone'].reset();
    }
  }

  AddFee() {
    this.ClearMsg();
    this.ErrorMsg = '';
    this.indLoading = false;
    this.feeRequired = false;

    if (this.DispositionForm.value.fee === "" || this.DispositionForm.value.fee == null) {
      this.feeRequired = true;
    } else {
      this.indLoading = true;
      this.GetRegularFeeDetails(this.DispositionForm.value.fee, this.DispositionTowId);
      //this.DispositionForm.value.fee.reset();
      this.DispositionForm.controls['fee'].reset();
    }
  }

  AddFeeToGrid(feeName, data) {
    this.ClearMsg();
    this.indLoading = false;
    this.feeRequired = false;
    let isFound = false;
    switch (feeName) {
      case 'DMV':
        if (this.DMVDetailsList && this.DMVDetailsList.length > 0) {
          for (let index = 0; index < this.DMVDetailsList.length; index++) {
            const element = this.DMVDetailsList[index];
            const desc = 'DMV - ' + element.licensePlate;
            isFound = this.FeeGrid.find(x => x.Description === desc);
            if (isFound) {
              this.ErrorMsg = desc + ' already exist';
              let data = {
                'ParentScreen': 'Disposition',
                'Msg': this.ErrorMsg,
                'Type': 'Error'
              }
              this.commService.sendMessage(data);
            }
            else {
              let fee = 0;
              fee = Number(element.amount);
              const obj = {
                'SectionId': 'DMV',
                'TowFeesId': 0,
                'FeeXREFId': null,
                'CategoryId': -1,
                'Variable': null,
                'WaiveReasonId': null,
                'OtherWaiveReason': null,
                'TowId': this.DispositionTowId,
                'CitationId': null,
                'DMVId': null,
                'ChargeId': null,
                'Description': 'DMV - ' + element.licensePlate,
                'Rate': fee,
                'Quantity': 1,
                'Amount': (fee) * 1, // Rate * Qty
                'WaiveAmount': 0,
                'SubTotal': (fee * 1) - 0,
                'Tax': 0,
                'TaxAmount': (fee * 1) * (0 / 100),
                'Total': (fee * 1) + ((fee * 1) * (0 / 100)), // Sub Total + TaxAmount
                'GrandTotal': (fee * 1) + ((fee * 1) * (0 / 100))
              };
              this.FeeGrid.push(obj);
            }
          }
        }
        break;
      case 'Citations':
        if (this.CIDataList && this.CIDataList.length > 0) {
          for (let index = 0; index < this.CIDataList.length; index++) {
            const element = this.CIDataList[index];
            const desc = element.ISSUENO + ' ' + element.LICPLATE + ' ' + element.LICSTATEPROV;
            isFound = this.FeeGrid.find(x => x.Description === desc);
            if (isFound) {
              this.ErrorMsg = desc + ' already exist';
              let data = {
                'ParentScreen': 'Disposition',
                'Msg': this.ErrorMsg,
                'Type': 'Error'
              }
              this.commService.sendMessage(data);
            }
            else {
              let fee = 0;
              fee = Number(element.AMOUNTDUE);
              const obj = {
                'SectionId': 'Citations',
                'TowFeesId': 0,
                'FeeXREFId': null,
                'CategoryId': -1,
                'Variable': null,
                'WaiveReasonId': null,
                'OtherWaiveReason': null,
                'TowId': this.DispositionTowId,
                'CitationId': Number(element.CitationId),
                'DMVId': null,
                'ChargeId': null,
                'Description': element.ISSUENO + ' ' + element.LICPLATE + ' ' + element.LICSTATEPROV,
                'Rate': fee,
                'Quantity': 1,
                'Amount': (fee) * 1, // Rate * Qty
                'WaiveAmount': 0,
                'SubTotal': (fee * 1) - 0,
                'Tax': 0,
                'TaxAmount': (fee * 1) * (0 / 100),
                'Total': (fee * 1) + ((fee * 1) * (0 / 100)), // Sub Total + TaxAmount
                'GrandTotal': (fee * 1) + ((fee * 1) * (0 / 100))
              };
              this.FeeGrid.push(obj);
            }
          }
        }
        break;
    }

    this.ErrorMsg = null;
    if (this.FeeGrid.length > 0) {
      const control = <FormArray>this.DispositionForm.controls['FeeListArray'];
      this.HasRecords = true;
      control.controls = [];
      this.grandTotal = 0;
      this.totalofTowingFee = 0;
      this.totalofDMV = 0;
      this.totalofCitations = 0;
      this.FeeGrid.forEach((item, index) => {
        control.push(this.createItem(
          this.FeeGrid[index]['Description'],
          this.FeeGrid[index]['Rate'],
          this.FeeGrid[index]['Quantity'],
          this.FeeGrid[index]['Amount'],
          this.FeeGrid[index]['WaiveAmount'],
          this.FeeGrid[index]['SubTotal'],
          this.FeeGrid[index]['Tax'],
          this.FeeGrid[index]['TaxAmount'],
          this.FeeGrid[index]['Total']
        ));
        if (item.ChargeId !== 0) {
          this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].disable();
          this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].disable();
          // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].disable();
          if (item.CategoryId == 2 && item.Variable == 1) {
            this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
          } else {
            this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].disable();
          }
        } else {
          this.DispositionForm.controls.FeeListArray['controls'][index].controls['Description'].enable();
          this.DispositionForm.controls.FeeListArray['controls'][index].controls['Rate'].enable();
          // this.DispositionForm.controls.FeeListArray['controls'][index].controls['Tax'].enable();
          this.DispositionForm.controls.FeeListArray['controls'][index].controls['Quantity'].enable();
        }
        this.grandTotal += Number(this.FeeGrid[index]['Total']);
        if (this.FeeGrid[index]['SectionId'] == 'DispositionFee') {
          // this.SelectReleaseToInsurance ||
          if (this.VehicleStatus == 'Released' || this.VehicleStatus == 'Received') {
            this.totalofTowingFee += Number(this.FeeGrid[index]['Total']);
          }
          else {
            this.totalofTowingFee = 0;
          }
        }
        if (this.FeeGrid[index]['SectionId'] == 'Citations') {
          this.totalofCitations += Number(this.FeeGrid[index]['Total']);
        }
        if (this.FeeGrid[index]['SectionId'] == 'DMV') {
          this.totalofDMV += Number(this.FeeGrid[index]['Total']);
        }
      });
    }
    this.indLoading = false;
  }

  QtyChange(field, i) {
  }

  closeWaiveRef() {
    this.modaltemplateWaiveRef.hide();
  }
  closeRemovePalteRef() {
    this.modaltemplateRemovePalteRef.hide();
  }
  closeCompanyRef() {
    this.CompanymodalRef.hide();
    // this.LoadCompany();
  }

  closeImpoundReleaseRef() {
    this.modaltemplateImpoundReleaseRef.hide();
  }

  closeFeeDetailsRef() {
    this.modaltemplateFeeDetailsRef.hide();
  }

  closeReleaseToRef() {
    this.modaltemplateReleaseToRef.hide();
  }

  closeReversePaymentRef() {
    this.modaltemplateReversePaymentRef.hide();
  }

  closeAuditDetailsRef() {
    this.modaltemplateAuditDetailsRef.hide();
  }

  closeAuditPaymentDetailsRef() {
    this.modaltemplateAuditPaymentDetailsRef.hide();
  }

  closeAuditReleaseDetailsRef() {
    this.modaltemplateAuditReleaseDetailsRef.hide();
  }

  closeProjectFeeRef() {
    this.modaltemplateProjectFeeRef.hide();
  }

  OpenRemovePlate(template: TemplateRef<any>, index: number) { 
    this.modaltemplateRemovePalteRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  OpenWaive(template: TemplateRef<any>, index: number) {
    this.WaiveModalForm.controls.desciption.disable();
    this.WaiveModalForm.controls.waiveTotalamount.disable();
    this.SuccessMsg = this.WaiveErrorMessage = this.WaiveErrorMsg = '';
    this.showErrorMessage = false;
    this.WaiveModalForm.reset();
    this.DeleteIndex = index;
    this.WaiveModalForm.controls.desciption.setValue(this.FeeGrid[index]['Description']);
    this.WaiveModalForm.controls.waiveReason.setValue(this.FeeGrid[index]['WaiveReasonId']);
    this.WaiveModalForm.controls.OtherWaiveReason.setValue(this.FeeGrid[index]['OtherWaiveReason']);
    this.WaiveModalForm.controls.waiveAmount.setValue(this.currencyFormat(this.FeeGrid[index]['WaiveAmount']));
    this.WaiveModalForm.controls.waiveTotalamount.setValue(this.currencyFormat(this.FeeGrid[index]['Amount']));

    if ((<number>this.FeeGrid[index]['WaiveAmount']) > 0) {
      this.IsWaived = true;
    }
    if (this.FeeGrid[index]['OtherWaiveReason']) {
      this.showOtherWaiveReason = true;
      this.WaiveModalForm.controls['OtherWaiveReason'].enable();
    } else {
      this.showOtherWaiveReason = false;
      this.WaiveModalForm.controls['OtherWaiveReason'].disable();
    }
    this.modaltemplateWaiveRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  checkedRemovePlates(ev) {
    if (ev.target.checked) {
      this.IsCheckedRemovePlates = true;
      this.f.removePlatesOptionFormControl.setValidators([Validators.required]);
      this.f.removePlatesOptionFormControl.updateValueAndValidity();
    } else {
      this.IsCheckedRemovePlates = false;
      this.f.removePlatesOptionFormControl.clearValidators();
      this.f.removePlatesOptionFormControl.updateValueAndValidity();
    }
  }

  validCheck(ev) {
    this.WaiveErrorMessage = "";

    const waivetotalamount = this.replaceDollar(this.WaiveModalForm.controls.waiveTotalamount.value);

    if (Number(ev.target.value) > Number(waivetotalamount)) {
      this.showErrorMessage = true;
      this.WaiveErrorMessage = "Waive Amount can't be greater than Amount";

    } else if (ev.target.value <= 0) {
      this.showErrorMessage = true;
      this.WaiveErrorMessage = "Enter a valid Waive Amount";
    }
    else {
      this.showErrorMessage = false;
    }
  }

  OpenImpoundRelease(template: TemplateRef<any>) {
    this.modaltemplateImpoundReleaseRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-sm' }));
  }

  OpenFeeDetails(template: TemplateRef<any>, index: number, ph) {
    this.feeDetails = ph;
    this.FeeDetails(ph.RefundId, ph.PaymentId, ph.Type);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateFeeDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  AuditAllFees(template: TemplateRef<any>) {
    this.AuditDetails(this.DispositionTowId);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateAuditDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  AuditPaymentFees(template: TemplateRef<any>) {

    this.AuditPaymentDetails(this.DispositionTowId);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateAuditPaymentDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  AuditReleaseFees(template: TemplateRef<any>) {
    this.AuditReleaseDetails(this.DispositionTowId);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateAuditReleaseDetailsRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  OpenProjectFee(template: TemplateRef<any>) {
    this.ProjectFeeForm.controls['ProjectFeeFormControl'].setValue(new Date());
    this.projectFeeMinDate = new Date();
    this.modaltemplateProjectFeeRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  FeeDetails(refundId, paidId, type) {
    if (type == 'Payment') {
      this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectPaidSummaryDetails?PaymentId=' + paidId)
        .subscribe(res => {
          if (res) {
            this.FeeDetailsList = res;
          }
        },
          error => (this.ErrorMsg = <any>error));
    } else {
      this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectRefundPaymentHistoryDetails?RefundId=' + refundId)
        .subscribe(res => {
          if (res) {
            this.FeeDetailsList = res;
          }
        },
          error => (this.ErrorMsg = <any>error));
    }
  }

  AuditDetails(towId) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetDispositionAudit?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.AuditDetailsList = res;
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

  AuditPaymentDetails(towId) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetDispositionPaymentAudit?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.AuditPaymentDetailsList = res;
        }

      },
        error => (this.ErrorMsg = <any>error));
  }

  AuditReleaseDetails(towId) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetDispositionReleaseAudit?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.AuditReleaseDetailsList = res;
        }

      },
        error => (this.ErrorMsg = <any>error));
  }

  OpenReleaseTo(template: TemplateRef<any>, index: number, item) {
    this.LoadReleaseDetailsList(item);
    this.SuccessMsg = this.SuccessMsg = '';
    this.modaltemplateReleaseToRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  LoadReleaseDetailsList(item) {
    this.ReleaseDetailsList = [{ 'Id': 1, 'ReleasedBy': item.Name, 'ReleasedTo': item.ReleasedToDescription, 'Name': item.OwnerFirstName, 'Address': item.Address, 'DLNo': item.IdNum, 'PhoneNo': item.ReleasePhoneNum }];
  }

  OpenPrintReceipt(item, index: number) {
    if (item.Type == 'Payment') {
      if (item.ReleasedTo == 'A') { // || item.ReleasedTo == 'M'
        window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + item.PaymentId, '_blank');
      } else {
        window.open('' + Global.ZebraPrintReportPath + '?reportName=PrintReceiptpaidid&showpdf=false&rendertopdf=false&PaidId=' + item.PaymentId, '_blank');
      }
    }
    else {
      window.open('' + Global.ZebraPrintReportPath + '?reportName=RefundReceipt&showpdf=false&rendertopdf=false&RefundId=' + item.RefundId, '_blank');
    }
  }

  OpenFeeCurrent() {
    window.open('' + Global.ZebraPrintReportPath + '?reportName=ConfigureRates&showpdf=false&rendertopdf=false&From_Date=&To_Date=&FeeType=ALL', '_blank');
  }

  OpenReversePayment(template: TemplateRef<any>, index: number) {
    this.ClearMsg();
    this.ModalName = 'Confirm Reverse Payment';
    this.ConfirmMessage = 'Are you sure want to reverse payment';
    setTimeout(() => {
      document.getElementById('okconfirmele').focus();
    }, 100);


    this.DeleteIndex = index;
    this.ModalType = 'reversepayment';
    this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  onPaymentTypeChange(obj, index: number) {
    this.PayForm.controls.PaymentListArray['controls'][index].controls['PaymentAmtFormControl'].setValue(null);
    this.PayForm.controls.PaymentListArray['controls'][index].controls['ChequenoFormControl'].setValue(null);
    const control = <FormArray>this.PayForm.controls['PaymentListArray'];
    this.SelectedTypeList.splice(index, 1, obj);
    this.changestatus(obj, index);
    this.calculateamt();
  }

  changestatus(obj, index) {
    // if (obj === 3) {
    //   (this.PayForm.controls.PaymentListArray['controls'][index].controls['PaymentAmtFormControl']).disable();
    //   (this.PayForm.controls.PaymentListArray['controls'][index].controls['ChequenoFormControl']).disable();
    //   this.OpenDenomination(this.templateDenomRef, index);
    // } else
    if (obj === 4) {
      this.PayForm.controls.PaymentListArray['controls'][index].controls['PaymentAmtFormControl'].enable();
      this.PayForm.controls.PaymentListArray['controls'][index].controls['ChequenoFormControl'].enable();
    } else {
      this.PayForm.controls.PaymentListArray['controls'][index].controls['PaymentAmtFormControl'].enable();
      this.PayForm.controls.PaymentListArray['controls'][index].controls['ChequenoFormControl'].disable();
    }
  }

  onPaymentChange() {
    this.calculateamt();
  }

  AddRow() {
    const control = <FormArray>this.PayForm.controls['PaymentListArray'];
    let i: number;
    let defaultvalue = 3;
    for (i = 0; i < control.length; i++) {
      if (this.PayForm.controls.PaymentListArray['controls'][i].controls['PaymentTypeFormControl'].value === 3) {
        defaultvalue = 4;
        i = control.length;
      }
    }
    control.push(this.initPayFormItem());
    this.Count = control.length;
    // tslint:disable-next-line:max-line-length

    this.PayForm.controls.PaymentListArray['controls'][this.Count - 1].controls['PaymentTypeFormControl'].setValue(defaultvalue, { onlySelf: true });
    this.SelectedTypeList.push(defaultvalue);
    this.changestatus(defaultvalue, this.Count - 1);
  }

  calculateamt() {
    this.ErrorMsg = '';
    this.TotalPaid = 0;
    let CashPaid = 0;
    let TotalNonCashAmount = 0;
    let totalVal: any = 0;
    for (let c = 0; c < this.PayformData.controls.length; c++) {
      if (this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentTypeFormControl'].value === 3) {
        // tslint:disable-next-line:max-line-length
        //this.TotalPaid = this.TotalPaid.toFixed(2) + parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
        let val1 = parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
        totalVal = val1 + totalVal;
        CashPaid = parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
      } else {
        // tslint:disable-next-line:max-line-length
        //this.TotalPaid = this.TotalPaid.toFixed(2) + parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
        let val1 = parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
        totalVal = val1 + parseFloat(totalVal);
        // tslint:disable-next-line:max-line-length
        TotalNonCashAmount = TotalNonCashAmount + parseFloat(this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0));
      }
    }
    this.TotalPaid = totalVal.toFixed(2);
    this.PaymentDue = this.TotalBidAmt > this.TotalPaid ? this.TotalBidAmt - this.TotalPaid : 0;
    if (TotalNonCashAmount <= this.TotalBidAmt) {
      const Amt = this.TotalBidAmt - TotalNonCashAmount - CashPaid;
      this.ChangeAmt = Amt < 0 ? -1 * Amt : 0;
    } else {
      this.ErrorMsg = 'Total non cash amount is more than total Bid Amount';
    }
  }

  isnull(obj, replacevalue: any): any {
    return obj ? obj : replacevalue;
  }

  SavePaymentNew(template: TemplateRef<any>) {
    if (this.PayForm.invalid) {
      this.validateAllFormFields(this.PayForm);
      return;
    }
    else {
      // if (this.DocumentPresentFlag == 0) {
      //   this.ModalName = 'Payment';
      //   this.ConfirmMessage = "You are releasing the vehicle without uploading any document.";
      //   this.DeleteIndex = -5;
      //   this.ModalType = 'Payment';
      //   this.modalConfirmRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
      // }
      // else {
      this.SavePayment();
      //}

    }
  }

  SavePayment() {
    if (this.PayForm.invalid) {
      this.validateAllFormFields(this.PayForm);
      return;
    }
    else {
      this.SuccessMsg = this.ErrorMsg = '';
      // if (this.PayForm.valid) {
      let InvalidAmt: string;
      const PaymentList = [];
      const control = <FormArray>this.PayForm.controls['PaymentListArray'];
      for (let c = 0; c < control.length; c++) {
        if (
          this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentTypeFormControl'].value === 2) {
          if (this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0) === 0) {
            InvalidAmt = 'Please enter amount in order to proceed';
          }
        } else {
          if (this.isnull(this.PayForm.controls.PaymentListArray['controls'][c].controls['PaymentAmtFormControl'].value, 0) === 0) {
            InvalidAmt = 'Please enter amount in order to proceed';
          }
        }
      }

      this.calculateamt();

      if (!this.isAdministrativeRelease) {
        if (this.TotalPaid < this.TotalBidAmt) {
          this.ErrorMsg = InvalidAmt ? InvalidAmt : 'Please make full payment in order to proceed';
        }
      }
      // if(this.isnull(this.ErrorMsg,'')!='')
      if (this.ErrorMsg) {
        return;
      }
      // if (!this.ErrorMsg) {
      if (!this.isAdministrativeRelease) {
        for (let i = 0; i < control.length; i++) {
          const PaymentC = control.controls[i].value;
          const ObjA: ReleasePaymentsType = new ReleasePaymentsType();
          ObjA.PaymentTypeId = PaymentC.PaymentTypeFormControl;
          if (PaymentC.PaymentAmtFormControl) {
            ObjA.Amount = PaymentC.PaymentAmtFormControl;
          } else {
            ObjA.Amount = 0;
          }
          if (PaymentC.ChequenoFormControl) {
            ObjA.ChequeNo = PaymentC.ChequenoFormControl;
          } else {
            ObjA.ChequeNo = '';
          }
          //ObjA.UserId = this.UserId;
          ObjA.TowId = Number(this.DispositionTowId);
          PaymentList.push(ObjA);
        }
      }

      const ReleasePaymentsList = [];
      const ObjId: ReleaseToInfoType = new ReleaseToInfoType();
      ObjId.TowId = Number(this.DispositionTowId);
      ObjId.VehicleReleasedDate = this.PayForm.controls.releasedDate.value;
      ObjId.ReleasedTo = this.ReleaseType(this.PayForm.controls.releaseTo.value);

      ObjId.OwnerId = this.PayForm.controls.name.value;
      if (this.PayForm.controls.nametxt.value) {
        ObjId.OwnerFirstName = this.PayForm.controls.nametxt.value;
      } else {
        if (this.ReleaseToNameList.length > 0) {
          const i = this.ReleaseToNameList.findIndex(k => k.Id === ObjId.OwnerId);
          ObjId.OwnerFirstName = this.ReleaseToNameList[i].Name;
        }
      }

      if (this.SelectedTowComapny != '') {
        ObjId.OwnerFirstName = this.SelectedTowComapny;
      }

      ObjId.Address = this.PayForm.controls.address.value;
      ObjId.ReleasePhoneNum = this.PayForm.controls.phone.value;
      ObjId.IdNum = this.PayForm.controls.dlno.value;
      ObjId.ReleasedNotes = null;
      ObjId.FeeChangeAmount = this.ChangeAmt;
      ObjId.ReleasedBy = this.UserId;
      ObjId.UserId = this.UserId;

      ObjId.GuidId = this.Guid;
      ObjId.ReleaseSignature = null;
      ObjId.Email = null;
      ObjId.IsMob = false;
      ObjId.TowCompanyId = this.SelectedTowComapnyid;
      ReleasePaymentsList.push(ObjId);

      // let DenomList = [];

      // if (!this.isAdministrativeRelease) {
      //   if (typeof this.SavedDenomTypeArray != "undefined" && this.SavedDenomTypeArray != null) {
      //     for (var i = 0; i < this.SavedDenomTypeArray.length; i++) {
      //       let DenomC = this.SavedDenomTypeArray[i];
      //       let ObjDenom: DispositionDenominationModel = new DispositionDenominationModel();
      //       ObjDenom.PaymentDenominationId = 0;
      //       ObjDenom.DenominationId = DenomC.DenomTypeObject.DenominationId
      //       ObjDenom.Quantity = DenomC.DenominationQuantity;
      //       if (DenomC.DenominationQuantity) {
      //         DenomList.push(ObjDenom);
      //       }
      //     }
      //   }
      // }
      const ObjSavePayment: ReleaseSaveModel = new ReleaseSaveModel();
      ObjSavePayment.ReleasePayments = PaymentList;
      ObjSavePayment.ReleaseToInfo = ReleasePaymentsList;
      // ObjSavePayment.Denomination = DenomList;

      this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/SaveTowReleaseInfo', ObjSavePayment).subscribe(result => {
        if (result.Id > 0) {
          this.IsLocked = false;
          this.ReceiptNo = result.result;
          // this.ReleaseTow();
          this.GetVehicleDetails(this.Guid);
          this.LoadGrid(this.DispositionTowId);
          //// window.top.location.href = Global.PoliceURL + "officer/ReleaseTabV2.aspx?TowStatus=Release";
          // Added by Satyajit -- 09-03-2020
          // Other System DLMS has Release and Impound Release, In GPTX  only one step i.e Impound Release
          // Below code are added for Impond Release  by Hiding the button "Impound Release"
          //this.SaveImpoundReleaseDirect();

        } else {
          this.ErrorMsg = result.result;
        }
      },
        error => {
          this.IsLocked = false;
          this.ErrorMsg = <any>error;
        });
    }
    // }
    // } else {
    //   this.validateAllFormFields(this.PayForm);
    // }
  }

  tabClick(ev) {
    this.ClearMsg();
    switch (ev.index) {
      case 0:
        break;
      case 1:

      case 2:
        //this.LoadDocuments();
        this.PayForm.controls['releasedBy'].disable();
        this.PayForm.controls.releasedBy.setValue(this.UserName);
        this.PayForm.controls['nametxt'].disable();
        break;

      case 3:
        this.PaymentHistory(this.DispositionTowId);
        this.RemovePlates(this.DispositionTowId);
        break;
    }
  }

  openReleaseCehecklist() {
    // this.httpC.get( Global.PoliceURL + "officer/Tabs/ReleaseCheckListTab.aspx").map((html:any) => this.myTemplate = html);
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

  LoadPaymentType() {
    this.ErrorMsg = '';
    this.PaymentTypeList = null;
    this._dataService.get(Global.DLMS_API_URL + 'AuctionWeb/GetPaymentMode').subscribe(
      paymenytyperesult => {
        if (paymenytyperesult != null && paymenytyperesult.length > 0) {
          this.PaymentTypeList = paymenytyperesult;
        } else {
        }
      },
      error => {
        this.ErrorMsg = <any>error;
      }
    );
  }

  LoadServerTime() {
    this.ErrorMsg = '';
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/GetCurrentTime').subscribe(
      servertimeresult => {
        if (servertimeresult != null) {
          this.ServerTime = servertimeresult;
          this.PayForm.controls.releasedDate.setValue(this.datePipe.transform(servertimeresult, 'MM/dd/yyyy hh:mm a'));
        } else {
        }
      },
      error => {
        this.ErrorMsg = <any>error;
      }
    );
  }

  isDisabled(obj) {
    return this.SelectedTypeList.includes(2) && obj === 2 || this.SelectedTypeList.includes(3) && obj === 3;
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

  RemoveRow(index: number) {
    const control = <FormArray>this.PayForm.controls['PaymentListArray'];
    control.removeAt(index);
    this.SelectedTypeList.splice(index, 1);
    this.Count = control.length;

    this.calculateamt();
  }

  LoadDispositionButtonPermission(PageId, RoleId): void {
    this.ErrorMsg = "";
    this._dataService.get(Global.DLMS_API_URL + 'api/UserPermission/GetRoleControlList?pageId=' + PageId + '&roleId=' + RoleId)
      .subscribe(ButtonPermissionLists => {
        if (ButtonPermissionLists != null) {
          this.DispositionButtonPermissionList = ButtonPermissionLists;
          for (var i = 0; i < this.DispositionButtonPermissionList.length; i++) {
            if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'savefee') {
              this.Dispositionsavefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'deletefee') {
              this.Dispositiondeletefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'waivefee') {
              this.Dispositionwaivefee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'addfee') {
              this.Dispositionaddfee = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'SaveFees') {
              this.DispositionSaveFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditFees') {
              this.DispositionAuditFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'PrintFees') {
              this.DispositionPrintFees = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'SaveRelease') {
              this.DispositionSaveRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditPayment') {
              this.DispositionAuditPayment = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'AuditRelease') {
              this.DispositionAuditRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ImpoundRelease') {
              this.DispositionImpoundRelease = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'FeeDetails') {
              this.DispositionFeeDetails = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ReleaseDetails') {
              this.DispositionReleaseDetails = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'ReversePayment') {
              this.DispositionReversePayment = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'PrintReceipt') {
              this.DispositionPrintReceipt = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            } else if (this.DispositionButtonPermissionList[i]['Control_Name'] == 'IsCloverEnable') {
              this.IsCloverRadioButtonEnable = Boolean(this.DispositionButtonPermissionList[i]["view_hide"]);
            }
          }
        }

      },
        error => { this.ErrorMsg = <any>error });
  }

  PrintProjectFee(itemObj) {
    //this.spinner.show();
    this._dataService.postAndDownload(Global.DLMS_API_URL + 'api/Disposition/DownloadProjectFees', {
      ReportName: 'ProjectedFees',
      TowId: this.DispositionTowId,
      Date: itemObj.ProjectFeeFormControl
    }
    ).subscribe((data) => {
      const newBlob = new Blob([data], { type: "application/pdf" });

      if (window.navigator && window.navigator["msSaveOrOpenBlob"]) {
        FileSaver.saveAs(newBlob, "ProjectFees" + '_' + new Date().getTime() + ".pdf");
      }
      else {
        var objectUrl = URL.createObjectURL(newBlob);
        window.open(objectUrl);
      }
      //this.spinner.hide();
    }, error => {
      //this.spinner.hide();
      //this.toastService.error(error.message, "Error");
    })
  }

  OpenCompany(template: TemplateRef<any>, Company: any) {
    this.CompanymodalRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-lg' }));
  }

  isHideByDescription(categoryId: string) {
    if (categoryId == '-1') {
      return false;
    }
    else {
      return true;
    }
  }

  sendTowAndStorageFee() {
    let data = {
      'totalofTowingFee': this.totalofTowingFee, //this.SelectReleaseToInsurance == null ? this.totalofTowingFee : 0,
      'totalofDMV': this.totalofDMV,
      'totalofCitations': this.totalofCitations,
      'GrandTotal': this.grandTotal,
      'FeesList': this.FeeGrid //this.SelectReleaseToInsurance == null ? this.FeeGrid : []
    }
    this.commService.sendFeesTabDataToDisposition(data);
  }

  toggle(key) {
    switch (key) {
      case "bodyTowStorage":
        this.bodyTowStorage = !this.bodyTowStorage;
        break;
      case "bodyReleaseCheckList":
        this.localStorageService.set("ScreenName", this.ParentScreen);
        if (!this.bodyReleaseCheckList) {
          this.addComp()
        } else {
          this.removeComp()
        }
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
      case "bodyPaymentHistory":
        this.bodyPaymentHistory = !this.bodyPaymentHistory;
        break;
      case "bodyDocuments":
        this.bodyDocuments = !this.bodyDocuments;
        break;
      case "bodyAdditionalPayment":
        this.bodyAdditionalPayment = !this.bodyAdditionalPayment;
        break;
    }
  }

  isPaymentVisible() {
    if ((this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released') && this.ParentScreen != 'SearchTow') {
      return true;
    } else if (this.ParentScreen == 'SearchTow') {
      return true;
    } else {
      return false;
    }
  }

  isReleaseToInsuranceVisible(ind) {
    if (ind == 'Button') {
      if (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released' || this.VehicleStatus == 'ImpoundRelease') {
        return true;
      }
      else {
        return false;
      }
    }

    if (ind == 'Sign' || ind == 'Save' || ind == 'Close' || (ind == 'Delete' && this.ReleaseToInsuranceId > 0)) {
      if (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released') {
        return true;
      }
      else {
        return false;
      }
    }

    if (ind == 'Delete' && this.ReleaseToInsuranceId > 0) {
      if (this.VehicleStatus == 'Received') {
        return true;
      }
      else {
        return false;
      }
    }
  }


  get cf() { return this.CitationForm.controls; }

  initCitationForm() {
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
        // this.cf.stateFormControl.setValidators([Validators.required]);
        // this.cf.stateFormControl.updateValueAndValidity();
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

  openReleaseToInsurance(template: TemplateRef<any>) {
    // localStorage.setItem('ParentScreen', 'ReleaseToInsurance');
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    this.noInsuranceSubmitted = false;
  //  this.addScript();
    this.getReleaseToInsurance(Number(this.DispositionTowId));

    if (this.SelectReleaseToInsurance) {
      this.isReadonly = false;
    }
    this.ClearMsg();
    this.bodyReleaseCheckList = true;
    this.toggle('bodyReleaseCheckList');
    this.modalReleaseToInsuranceModalRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
    document.getElementById('InsuranceCompanyName').focus();
  }

  closeReleaseToInsuranceRef() {
    // localStorage.removeItem('ParentScreen');
    this.isReadonly = false;
    this.noInsuranceSubmitted = false;
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    //this.removeScript();
    this.modalReleaseToInsuranceModalRef.hide();
    this.getReleaseToInsurance(Number(this.DispositionTowId));
    this.localStorageService.set("ScreenName", this.ParentScreen);
  }

  SaveNoInsurance() {
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    const resultDiv = document.getElementById("result") as HTMLDivElement;
    resultDiv.innerHTML = '';
    resultDiv.className = '';

    const ele = document.getElementById("sigImageData") as HTMLTextAreaElement;
    this.noInsuranceSubmitted = true;
    if (this.ReleaseToInsuranceForm.invalid) {
      return;
    }
    let model: ReleaseToInsuranceModel = new ReleaseToInsuranceModel();
    model.Id = this.ReleaseToInsuranceId;
    model.TowId = Number(this.DispositionTowId);
    model.InsuranceCompanyName = this.nif.insuranceCompanyNameFormControl.value;
    model.Notes = this.nif.NotesFormControl.value;
    model.Name = this.nif.OwnerNameFormControl.value;
    if (ele) {
      model.Signature = ele.value;
    } else {
      model.Signature = '';
    }
    model.UserId = this.UserId;

debugger
   if(this.SelectReleaseToInsurance)
   {
    model.FirstName = this.SelectReleaseToInsurance.FirstName == null ? '' : this.SelectReleaseToInsurance.FirstName;
    model.LastName  = this.SelectReleaseToInsurance.LastName== null ? '' :this.SelectReleaseToInsurance.LastName;
    model.Address  = this.SelectReleaseToInsurance.Address== null ? '' :this.SelectReleaseToInsurance.Address;
    model.City  = this.SelectReleaseToInsurance.City== null ? '' :this.SelectReleaseToInsurance.City;
    model.State  = this.SelectReleaseToInsurance.STATE== null ? '' :this.SelectReleaseToInsurance.STATE;
    model.Zip  = this.SelectReleaseToInsurance.Zip== null ? '' :this.SelectReleaseToInsurance.Zip; 
    model.Phone  = this.SelectReleaseToInsurance.Phone== null ? '' :this.SelectReleaseToInsurance.Phone;
    model.Email  = this.SelectReleaseToInsurance.Email== null ? '' :this.SelectReleaseToInsurance.Email;
   }
   if(!this.SelectReleaseToInsurance)
   {
     model.BusinessId =-1;
   }
   else
   {
    model.BusinessId = this.SelectReleaseToInsurance.BusinessId;
   }
   

    this._dataService.post(Global.DLMS_API_URL + 'api/Disposition/ReleaseToInsurance', model)
      .subscribe(res => {
        if (res && Number(res.Id) > 0) {
          this.ModalSuccessMsg = 'Save Successfully';
          this.noInsuranceSubmitted = false;
          this.getReleaseToInsurance(Number(this.DispositionTowId));
          this.ReleaseToInsuranceId = res.Id;
        }
        else {
          this.ModalErrorMsg = 'Error';
          this.noInsuranceSubmitted = false;
        }
      }, error => {
        this.ModalErrorMsg = 'Error';
        this.noInsuranceSubmitted = false;
      });
  }

  getReleaseToInsurance(towId) {
    this.ReleaseToInsuranceId = 0;
    this.SelectReleaseToInsurance = null;
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToInsurance?TowingId=' + towId)
      .subscribe(res => {
        if (res) {
          this.SelectReleaseToInsurance = res;
          this.nif.insuranceCompanyNameFormControl.setValue(this.SelectReleaseToInsurance.InsuranceCompanyName);
          this.nif.NotesFormControl.setValue(this.SelectReleaseToInsurance.Notes);
          this.nif.OwnerNameFormControl.setValue(this.SelectReleaseToInsurance.Name);

          if (this.SelectReleaseToInsurance.TTIApproval == true) {
            this.nif.cashierFormControl.setValue(this.SelectReleaseToInsurance.ApprovedBy);
            this.nif.transactionDateFormControl.setValue(this.datePipe.transform(this.SelectReleaseToInsurance.ApprovedDate, 'MM/dd/yyyy hh:mm a'));
          } else {
            this.nif.cashierFormControl.setValue(this.SelectReleaseToInsurance.Cashier);
            this.nif.transactionDateFormControl.setValue(this.datePipe.transform(this.SelectReleaseToInsurance.CreatedDate, 'MM/dd/yyyy hh:mm a'));
          }
          this.ReleaseToInsuranceId = this.SelectReleaseToInsurance.Id;
          this.currSignature = 'data:image/jpg;base64,' + (this.sanitizer.bypassSecurityTrustResourceUrl(this.SelectReleaseToInsurance.Signature) as any).changingThisBreaksApplicationSecurity;
        }
        else {
          this.SelectReleaseToInsurance = null;
        }
        this.releaseToInsurancePush();
      },
        error => (this.ErrorMsg = <any>error));
  }

  deleteReleaseToInsurance() {
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/DeleteReleaseToInsurance?TowId=' + Number(this.DispositionTowId) + '&Id=' + this.ReleaseToInsuranceId + '&UserId=' + this.UserId)
      .subscribe(res => {
        if (res && Number(res.Id) > 0) {
          this.ModalSuccessMsg = 'Deleted Successfully';
          this.ReleaseToInsuranceId = 0;
          this.SelectReleaseToInsurance = null;
          this.ReleaseToInsuranceForm.reset();
          this.noInsuranceSubmitted = false;
          this.getReleaseToInsurance(Number(this.DispositionTowId));
        }
        else {
          this.ModalErrorMsg = 'Error';
        }
      },
        error => {
          this.ModalErrorMsg = 'Error';
        });
  }

  releaseToInsurancePush() {
    if (this.FeeGrid.length > 0) {
      this.grandTotal = 0;
      this.totalofTowingFee = 0;
      this.totalofDMV = 0;
      this.totalofCitations = 0;
      this.FeeGrid.forEach((item, index) => {
        this.grandTotal += Number(this.FeeGrid[index]['Total']);
        if (this.FeeGrid[index]['SectionId'] == 'DispositionFee') {
          // this.SelectReleaseToInsurance ||
          if (this.VehicleStatus == 'Released' || this.VehicleStatus == 'Received') {
            this.totalofTowingFee += Number(this.FeeGrid[index]['Total']);
          }
          else {
            this.totalofTowingFee = 0;
          }
        }
        if (this.FeeGrid[index]['SectionId'] == 'Citations') {
          this.totalofCitations += Number(this.FeeGrid[index]['Total']);
        }
        if (this.FeeGrid[index]['SectionId'] == 'DMV') {
          this.totalofDMV += Number(this.FeeGrid[index]['Total']);
        }
      });
    }
    this.sendTowAndStorageFee();
  }

  printReleaseToInsurance() {
    window.open('' + Global.ZebraPrintReportPath + '?reportName=ReleaseToInsurance&showpdf=false&rendertopdf=false&TowId=' + this.DispositionTowId, '_blank');
  }

  onSignature() {
    signature.onSign();
  }

  onSignatureDone(ind) {
    signature.onDone(ind);
  }

  isReleaseToTTIVisible(ind) {
    if (ind == 'Button') {
      if (this.VehicleStatus == 'Received' || this.VehicleStatus == 'Released' || this.VehicleStatus == 'ImpoundRelease') {
        return true;
      }
      else {
        return false;
      }
    }
  }

  openTTIProcess(template: TemplateRef<any>) {
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    this.ClearMsg();
   // this.addScript();
    this.bodyReleaseCheckList = true;

    this.toggle('bodyReleaseCheckList');
    this.modalTTIProcessRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));
  }

  closeTTIProcessRef() {
    this.isReadonly = false;
    this.ModalErrorMsg = this.ModalSuccessMsg = '';
    this.removeScript();
    this.modalTTIProcessRef.hide();
    this.localStorageService.set("ScreenName", this.ParentScreen);

  }

  public addComp() {
    this.entry.clear();
   // this.addScript()
    const factory = this.resolver.resolveComponentFactory(ReleaseChecklistComponent);
    this.componentRef = this.entry.createComponent(factory);
    this.componentRef.instance.UserId = this.UserId;
    this.componentRef.instance.ParentScreenName = this.ParentScreen;
    this.componentRef.instance.towId = this.DispositionTowId;
    this.componentRef.instance.recordId = this.RecordId;
    this.componentRef.instance.vehicleStatus = this.VehicleStatus;
    this.componentRef.instance.HasUploadPermission = this.HasUploadPermission;
    this.componentRef.instance.HasScanPermission = this.HasScanPermission;
  }

  public removeComp() {
    if (this.componentRef != undefined) {
      this.removeScript();
      this.componentRef.destroy();
    }
  }

  addScript() {
    let script1 = document.createElement("script");
    script1.setAttribute("id", "install");
    script1.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.install.js");
    document.body.appendChild(script1);
    let script2 = document.createElement("script");
    script2.setAttribute("id", "initiate");
    script2.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.initiate.js");
    document.body.appendChild(script2);
    let script3 = document.createElement("script");
    script3.setAttribute("id", "config");
    script3.setAttribute("src", "https://ddocs.govtow.com/twain/resources/dynamsoft.webtwain.config.js");
    document.body.appendChild(script3);

  }
  onClick() {
    this.spinner.hide();
  }
  removeScript() {
    try {
      const el1 = document.getElementById('install');
      if (el1)
        el1.remove();
      const el2 = document.getElementById('initiate');
      if (el2)
        el2.remove();
      const el3 = document.getElementById('config');
      if (el3)
        el3.remove();
    } catch (error) {

    }
  }

  async paymentEligibilityCheck(towId) {
    await this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/PaymentEligibilityCheck?TowId=' + towId)
      .subscribe(res => {
        this.paymentEligibilityCheckResponse = res[0];
      }, error => {
        this.ErrorMsg = <any>error;
      });
  }

  LoadOwner() {
    this._dataService.get(Global.DLMS_API_URL + 'api/Disposition/SelectReleaseToName?TowId=' + this.DispositionTowId + '&Type=O')
      .subscribe(res => {
        if (res && res.length > 0) {
          this.OwnerList = res;
        } else {
          this.OwnerList = [];
        }
      },
        error => (this.ErrorMsg = <any>error));
  }

}

class TowReleaseModel {
  towingId: number;
  ReportingAgencyId: number;
  RecordId: string;
  ReleaseType: number;
}

class TowModel {
  TowId: number;
  RecordId: number;
  RequestedById: number;
  ClientId: number;
  ClientName: string;
  ClientPhone: string;
  ClientEmail: string;
  MemberName: string;
  MemberNum: string;
  PONum: string;
  PropertyName: string;
  TowReasonId: number;
  TowTruckTypeId: number;
  SpecialEquipmentId: number;
  TowLocationTypeId: number;
  TowedFromAddress: string;
  TowedToId: number;
  StorageId: number;
  OtherStorage: string;
  DriverId: number;
  Notes: string;
  UserId: number;
  TowCompanyId: number;
  IsDispatch: boolean;
  DispatchStatusId: number;
  ExternalId: string;
  TowedFromLat: string;
  TowedFromLong: string;
  TowedToLat: string;
  TowedToLong: string;
  WreckerTypeId: number;
  ReportingAgencyId: number;
  IsNewTow: boolean;
  DriverName: string;

  StateId: number;
  MakeId: number;
  ModelId: number;
  TopColorId: number;
  SecondColorId: number;

  TowCompanyRecordId: number;
  DLMSDispatchStatusId: number;
  TowCompanyName: string;
  TowReasonName: string;
  TowLocationTypeName: string;
  WreckerTypeName: string;
  TowedFromLocation: string;
  TowedToName: string;
  ImpoundLotName: string;
  TowedToOtherLoc: string;

  LicensePlate: string;
  State: string;
  Vin: string;
  Year: number;
  MakeName: string;
  ModelName: string;
  OtherMake: string;
  OtherModel: string;
  TopColorName: string;
  SecondColorName: string;
  StateLicNum: string;
  VSFNum: string;

  DispatchArrivalDateTime: string;
  DispatchDepartDateTime: string;
  AcceptDate: string;
  CreatedDate: string;

  XrefName: any;
  InitiatedBy: any;
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

class ReleasePaymentsType {
  TowId: number;
  PaymentTypeId: number;
  Amount: number;
  ChequeNo: string;
}

class RemovePlateEntity {
  UserId: number;
  TowId: number;
  RemovePlate: boolean;
  RemovePlateOption: number;
  RemovePlateInstruction: string;
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

class ReleaseSaveModel {
  ReleaseToInfo: ReleaseToInfoType[];
  ReleasePayments: ReleasePaymentsType[];
  // Denomination: any[];
}

class ReverseBidderPaymentModel {
  PaymentId: number;
  UserId: number;
}

class SaveDispositionModel {
  TowId: number;
  TowFeesId: number;
  UserId: number;
  ReportingAgencyId: number;
  GuId: string;

}

class SaveImpoundReleaseModel {
  TowId: number;
  StorageStatusId: number;
  DriveMode: number;
  ImpoundReleasedDate: string;
  ImpoundReleasedBy: number;
}

class ReverseTowReleaseModel {
  TowId: number;
  PaidId: number;
  UserId: number;
}

// class DenomTypeArrayModel {
//   DenomTypeObject: DenomTypeModel;
//   DenominationQuantity: number;
//   DenominationAmt: number;
// }
// class DenomTypeModel {
//   DenominationId: number;
//   DenominationAmt: number;
//   Description: string;
// }
// class DispositionDenominationModel {
//   PaymentDenominationId: number
//   DenominationId: number
//   Quantity: number
// }
class ReleaseToInsuranceModel {
  Id: number;
  TowId: number;
  InsuranceCompanyName: string;
  Notes: string;
  Name: string;
  Signature: string;
  UserId: number;
BusinessId:number;
    
    FirstName : string;
    LastName : string;
    Address : string;
    City : string;
    State : string;
    Zip : string;
    Email : string;
    Phone : string;


}
