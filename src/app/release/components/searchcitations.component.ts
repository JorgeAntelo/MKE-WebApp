import { Component, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
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

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'searchcitations',
  templateUrl: './searchcitations.component.html',
  styleUrls: ['./searchcitations.component.css'],
  providers: [DatePipe, CurrencyPipe]
})
export class SearchcitationsComponent implements OnInit {
  PageId: number;
  RoleId: number;
  UserId: number;
  Guid: string;
  UserName: string;
  TowId: number;
  bodyCitations = true;
  PermitId: number;
  CitationId: number;
  DMVID: number;
  PaymentPlanId: number;

  totalofCitations = 0;
  totalofPermits = 0;
  totalofDMV = 0;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  parentScreenData: any;
  citationSearchData: any;
  CIDataList = [];
  serviceCitationsData: any;
  servicePermitsData: any;
  serviceDMVData: any;
  subscription: Subscription;
  submitted = false;
  indLoading = false;
  ErrorMsg: string;
  SuccessMsg: string;
  LoaderImage: string;
  ModalLoaderImage: string;
  CitationForm: FormGroup;
  PaymentDue = 0;
  ParentScreen = 'SearchCitations';
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
    this.activatedRoute.queryParams.subscribe(params => {
      this.PageId = params.PageId;
      this.RoleId = params.RoleId;
      this.TowId = params.TID;
      this.UserId = params.uid;
      if (params.Id) {
        this.Guid = params.Id;
      }
      else {
        this.Guid = this.localStorageService.get('GUID');
      }
      this.UserName = this.localStorageService.get('UserName');
    });

    this.subscription = this.commService.getCitationsData().subscribe(res => {
      if (res) {
        this.serviceCitationsData = res.citations;
        this.totalofCitations = res.citations.totalofCitations;
      }
    });

    // this.subscription = this.commService.getPermitsData().subscribe(res => {
    //   if (res) {
    //     this.servicePermitsData = res.permits;
    //     this.totalofPermits = res.permits.totalofPermits;
    //   }
    // });

    this.subscription = this.commService.getClearCashiering().subscribe(res => {
      if (res) {
        this.CitationForm.reset();
      }
    });

    // this.subscription = this.commService.getDMVData().subscribe(res => {
    //   if (res) {
    //     this.serviceDMVData = res.dmv;
    //     this.totalofDMV = res.dmv.totalofDMV;
    //   }
    // });

    // this.subscription = this.commService.getPaymentCartData().subscribe(res => {
    //   if (res) {
    //     this.PaymentDue = res.cart.PaymentDue;
    //     this.ChangeAmt = res.cart.ChangeAmt;
    //     this.ReceiptNo = res.cart.ReceiptNo;
    //   }
    // });

  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  getSumSummary(totalofCitations, totalofPermits, totalofDMV) {
    return this.PaymentDue = totalofCitations + totalofPermits + totalofDMV
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
    this.CitationForm.reset();
    this.commService.sendClearCashiering('clear');

    this.cf.searchTypeFormControl.setValue('P');
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

  toggle(key) {
    switch (key) {
      case "bodyCitations":
        this.bodyCitations = !this.bodyCitations;
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