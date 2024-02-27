import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormHooks } from '@angular/forms/src/model';
import { MatOptionSelectionChange } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';
import { ExcelService } from 'src/app/core/services/excel.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ConfirmModalComponent } from 'src/app/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-scrap-rate',
  templateUrl: './scrap-rate.component.html',
  styleUrls: ['./scrap-rate.component.css']
})
export class ScrapRateComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('templateAddScrapRate') public templateAddScrapRate: TemplateRef<any>;
  public modalAddScrapRateRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  ScrapRateForm: FormGroup;
  SearchScrapRateForm: FormGroup;
  utilService: UtilService;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  company: any = []; filteredCompany: Observable<any[]>;
  indLoading: boolean;
  ScrapCompanyList: any = [];
  UserId: number;
  CompanyId: number = 0;
  RateId: number = 0;
  IsInterval: any;
  searchCompany: any;
  filteredSearchCompany: Observable<any>;
  Header: string;
  ErrorMessage: string;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private utilServiceProvider: UtilService,
    private modalService: BsModalService,
    private excelService: ExcelService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe) {
    this.activatedRoute.queryParams.subscribe(params => {
      let LoggeduserId = params.uid;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
    });
    this.utilService = utilServiceProvider;
    this.createForm();
  }

  ngOnDestroy(): void {
    clearInterval(this.IsInterval);
  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.LoadCompany('');
    this.LoadCompanyList();
  }

  ngAfterViewInit(): void {
    this.setHeight();
  }

  setHeight() {
    // this.IsInterval = setInterval(() => {
    window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    // }, Global.SetHeightTime);
  }

  private createForm() {
    this.SearchScrapRateForm = new FormGroup({
      SearchCompanyNameFormControl: new FormControl('')
    });

    this.ScrapRateForm = new FormGroup({
      CompanyNameFormControl: new FormControl('', [Validators.required]),
      EffectiveDateFormControl: new FormControl('', [Validators.required]),
      ScrapRateFormControl: new FormControl('', [Validators.required, Validators.pattern(Global.DECIMAL_REGEX)])
    });
  }

  searchCompanyReset(): void {
    setTimeout(() => {
      (this.SearchScrapRateForm.controls['SearchCompanyNameFormControl']).setValue(null);
    }, 1);
  }

  reset(): void {
    setTimeout(() => {
      (this.ScrapRateForm.controls['CompanyNameFormControl']).setValue(null);
    }, 1);
  }

  filterCompany(val) {
    return val ? this.company.filter(s => s.CompanyName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.company;
  }

  filterSearchCompany(val) {
    return val ? this.searchCompany.filter(s => s.CompanyName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.searchCompany;
  }

  displayFn(company): string {
    return company ? company.CompanyName : company;
  }

  LoadCompany(State): void {
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapCompany?ScrapCompanyId=0')
      .subscribe(reslist => {
        this.searchCompany = reslist;
        this.company = reslist;

        this.filteredSearchCompany = this.SearchScrapRateForm.controls['SearchCompanyNameFormControl'].valueChanges
          .startWith(null)
          .map(x => x && typeof x === 'object' ? x.CompanyName : x)
          .map(name => this.filterSearchCompany(name));
        /* if (this.searchCompany != null) {
          (<FormControl>this.SearchScrapRateForm.controls['SearchCompanyNameFormControl'])
            .setValue(this.searchCompany[0], {});
          this.CompanyId = this.searchCompany[0].CompanyId
          this.LoadCompanyList();
        } */

        this.filteredCompany = this.ScrapRateForm.controls['CompanyNameFormControl'].valueChanges
          .startWith(null)
          .map(x => x && typeof x === 'object' ? x.CompanyName : x)
          .map(name => this.filterCompany(name));
      },
        error => this.ErrorMsg = <any>error);
  }

  /* changeCompany(ev: MatOptionSelectionChange) {
    if (ev.source.selected) {
      this.CompanyId = ev.source.value.CompanyId;
      
      this.LoadCompanyList();
    }
  } */
  Search(obj: any) {
    this.LoadCompanyList();
  }
  LoadCompanyList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.indLoading = true;
    this.ScrapCompanyList = [];
    this.CompanyId = this.SearchScrapRateForm.controls['SearchCompanyNameFormControl'].value ? this.SearchScrapRateForm.controls['SearchCompanyNameFormControl'].value.CompanyId : 0;

    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetAllScrapRatesByCompany?CompanyId=' + this.CompanyId)
      .subscribe(items => {
        this.indLoading = false;
        if (items != null && items.length > 0) {
          this.ScrapCompanyList = items;
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  Clear() {
    this.SearchScrapRateForm.reset();
    (<FormControl>this.SearchScrapRateForm.controls['SearchCompanyNameFormControl'])
      .setValue(null);
    this.LoadCompanyList();
  }

  Save(obj) {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.utilService.validateAllFormFields(this.ScrapRateForm);
    if (this.ScrapRateForm.valid) {
      this.indLoading = true;
      var date = new Date(this.ScrapRateForm.controls["EffectiveDateFormControl"].value);
      var formatted = moment(date).format('YYYY-MM-DD');
      var RatesModel =
      {
        "RateId": this.RateId,
        "ScrapCompanyId": this.ScrapRateForm.controls["CompanyNameFormControl"].value.CompanyId,
        "UserId": this.UserId,
        "EffectiveDate": formatted,
        "Rate": obj.ScrapRateFormControl
      };
      this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/SaveScrapCompanyRate', RatesModel)
        .subscribe(items => {
          this.indLoading = false;
          if (items.Id == 1) {
            this.Clear();
            this.LoadCompanyList();
            this.modalAddScrapRateRef.hide();
            this.SuccessMsg = items.result;
          } else if (items.Id == 2) {
            this.Clear();
            this.modalAddScrapRateRef.hide();
            const initialState = {
              title: `Confirmation`,
              message: `${items.result}`,
              btnCancelText: `No`,
              btnOkText: `Yes`,
              callback: (result) => {
                if (result == 'yes') {
                  this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/UpdateScrapRecords', RatesModel)
                    .subscribe(items => {
                      this.indLoading = false;
                      this.LoadCompanyList();
                      this.SuccessMsg = items.result;
                    },
                      error => {
                        this.indLoading = false;
                        this.ErrorMessage = <any>error
                      });
                }
              }
            };
            this.modalService.show(ConfirmModalComponent, { initialState });
          }else if (items.Id == 3) {
            this.ErrorMessage = items.result;
          } else {
            this.ErrorMessage = items.result;
          }
        },
          error => {
            this.indLoading = false;
            this.ErrorMessage = <any>error
          });
    }
  }

  AddNew(template: TemplateRef<any>) {
    this.Header = 'Add Scrap Rate';
    this.ErrorMessage = "";
    this.SuccessMsg = "";
    this.RateId = 0;
    this.modalAddScrapRateRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-sm modal-dialog-top' }));
    this.ScrapRateForm.controls['CompanyNameFormControl'].enable();
    this.ScrapRateForm.controls['EffectiveDateFormControl'].reset();
    this.ScrapRateForm.controls['ScrapRateFormControl'].reset();
  }

  Edit(template: TemplateRef<any>, obj) {
    this.Header = "Edit Scrap Rate";
    this.ErrorMessage = "";
    this.ErrorMessage = "";
    this.SuccessMsg = "";
    this.RateId = 0;
    this.RateId = obj.Action;
    this.ScrapRateForm.controls['EffectiveDateFormControl'].setValue(obj['Effective Date']);
    this.ScrapRateForm.controls['ScrapRateFormControl'].setValue(obj.Rate);
    let company = this.company.filter(item => item.CompanyId === obj.ScrapCompanyId)
    this.ScrapRateForm.controls['CompanyNameFormControl'].setValue(company[0]);
    this.ScrapRateForm.controls['CompanyNameFormControl'].disable();
    this.modalAddScrapRateRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-sm modal-dialog-top' }));
  }

  Delete(id) {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    let DeleteModel = {
      RateId: id,
      UserId: this.UserId
    }
    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/DeleteScrapRate', DeleteModel)
      .subscribe(res => {
        this.indLoading = false;
        if (res.Id > 0) {
          this.Clear();
          this.SuccessMsg = "Record Deleted Successfully"
        }
        else {
          this.ErrorMsg = res.result
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }

  Cancel() {
    this.ScrapRateForm.controls['EffectiveDateFormControl'].reset();
    this.ScrapRateForm.controls['ScrapRateFormControl'].reset();
  }
  download() {
    let Itemexport = [];

    for (let i = 0; i < this.ScrapCompanyList.length; i++) {
      Itemexport.push({
        'Scrap Company': this.ScrapCompanyList[i]['Scrap Company'],
        'Effective Date': this.datePipe.transform(this.ScrapCompanyList[i]['Effective Date'], 'MMM d, y, h:mm a') + "\t",
        'Rate($)': this.currencyPipe.transform(this.ScrapCompanyList[i]['Rate'], 'USD').replace('$', ''),
        'Modified Date': this.datePipe.transform(this.ScrapCompanyList[i]['Modified Date'], 'MMM d, y, h:mm a') + "\t",
        'Modified By': this.ScrapCompanyList[i]['ModifiedBy'],

      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'Scrap Rate');
    this.indLoading = false;
  }
}
