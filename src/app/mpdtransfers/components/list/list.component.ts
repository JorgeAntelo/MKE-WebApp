import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Global } from '../../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ThrowStmt } from '@angular/compiler';
import { MpdtransfersService } from '../../mpdtransfers.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  indLoading = false;
  transferLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  TransferErrorMsg: any;
  TransferSuccessMsg: any;
  UserId: Number;
  mpdtransfersService: MpdtransfersService;
  TowRowsList: any;
  TowColumnsList: any;
  SearchForm: FormGroup;
  TransferForm: FormGroup;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  CurrentDate = new Date();
  MakeList: any;
  TowConfig: any;
  RecordId: any;
  operators = []; filteredOperators: Observable<any[]>;
  spaces = []; filteredSpaces: Observable<any[]>;
  lots = []; filteredLots: Observable<any[]>;
  TowingTransferId: number;
  TowingId: number;

  @ViewChild('templateTransfer') public templateTransfer: TemplateRef<any>;
  public modalTransferRef: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private transferlistServiceProvider: MpdtransfersService,
    private excelService: ExcelService,
    private modalService: BsModalService, ) {
    this.mpdtransfersService = transferlistServiceProvider;
    activatedRoute.params.subscribe(val => {
      let that = this;
    });
    this.activatedRoute.queryParams.subscribe(params => {
      let LoggeduserId = params.UserId;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
    });
  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.Pagenumber = 1;
    //this.LoadMake();
    this.LoadTransferList(this.SearchForm);
  }
  createForm() {
    this.SearchForm = new FormGroup({
      /*   RecordIdFormControl: new FormControl(''),
         PlateFormControl: new FormControl(''),
         VinFormControl: new FormControl(''),
         MakeFormControl: new FormControl(''),
         FromDateFormControl: new FormControl(''),
         ToDateFormControl: new FormControl('')*/
    });
    this.TransferForm = new FormGroup({
      OperatorFormControl: new FormControl(''),
      SpaceFormControl: new FormControl('', [Validators.required]),
      LotFormControl: new FormControl('', [Validators.required]),
    });
  }
  Search(obj) {
    if (this.SearchForm.valid) {
      this.LoadTransferList(obj);
    }
  }
  LoadTransferList(obj): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    /* let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
     let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
     let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
     let Make = this.SearchForm.controls["MakeFormControl"].value ? this.SearchForm.controls["MakeFormControl"].value : '';
     let FromDate = this.SearchForm.controls["FromDateFormControl"].value ? (this.SearchForm.controls["FromDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["FromDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["FromDateFormControl"].value.getFullYear() : '';
     let ToDate = this.SearchForm.controls["ToDateFormControl"].value ? (this.SearchForm.controls["ToDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ToDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ToDateFormControl"].value.getFullYear() : '';
   */
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'tow/GetMPDTransfersList?PageNum=' + this.Pagenumber +
      "&PageSize=" + this.PageSize //+
      /*'&RecordId=' + RecordId +
      '&Plate=' + Plate +
      '&Vin=' + Vin +
      '&Make=' + Make +
      '&FromDate=' + FromDate +
      '&ToDate=' + ToDate*/
    )
      .subscribe(items => {

        this.indLoading = false;
        if (items != null) {

          this.TowRowsList = items.Data.DetailsList;
          this.TowColumnsList = items.Data.Columns;
          this.TowColumnsList = this.TowColumnsList.filter(c => c.IsVisible === true)
          console.log(this.TowColumnsList);
          //this.TowConfig = items.Config;
          if (this.TowRowsList) {
            this.TotalPagenum = this.TowRowsList[0]["TotalPages"];
            this.TotalPageCount = [];
            for (var i = 1; i <= this.TotalPagenum; i++) {
              this.TotalPageCount.push({ Id: i, Description: i });
            }
            if (this.Pagenumber == 1) {
              this.PageId = 1;
            }
            this.TotalRecord = "Total Records Found: " + this.TowRowsList[0]["TotalRecords"];
            this.TowRowsList.forEach(element => {
              var link = this.TowColumnsList[0]["Link"];
              link = link.replace('{TOWID}', element.TowingId);
              element["link"] = link
            });
          }

        }
        else {
          this.TowRowsList = [];
          this.TowColumnsList = {};
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  Clear() {
    this.SearchForm.reset();
    this.LoadTransferList(this.SearchForm);
  }
  onPageChange(PageNumber: any) {
    this.Pagenumber = PageNumber;
    this.PageId = PageNumber;
    this.LoadTransferList(this.SearchForm.value);
  }

  first() {
    if (this.PageId === 'undefined' || this.PageId > 1) {
      this.Pagenumber = 1;
      this.PageId = this.Pagenumber;
      this.LoadTransferList(this.SearchForm.value);
    }
  }

  previous() {
    if (this.PageId != 'undefined') {
      if (this.PageId > 1) {
        this.Pagenumber = this.PageId - 1;
        this.PageId = this.Pagenumber;
        this.LoadTransferList(this.SearchForm.value);
      }
    }
  }

  next() {
    if (this.PageId != 'undefined') {
      if (this.PageId < this.TotalPagenum) {
        this.Pagenumber = this.PageId + 1;
        this.PageId = this.Pagenumber;
        this.LoadTransferList(this.SearchForm.value);
      }
    }
  }

  last() {
    if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
      this.Pagenumber = this.TotalPagenum;
      this.PageId = this.Pagenumber;
      this.LoadTransferList(this.SearchForm.value);
    }

  }

  download() {
    let Itemexport = [];

    for (let i = 0; i < this.TowRowsList.length; i++) {
      Itemexport.push({
        'RecordId': this.TowRowsList[i]['RecordId'].Value,
        'License Plate': this.TowRowsList[i]['Plate'],
        'Vin': this.TowRowsList[i]['VIN'],
        'Year': this.TowRowsList[i]['VehYear'],
        'Model': this.TowRowsList[i]['Model'],
        'Vehicle Received Date': this.TowRowsList[i]['VehicleReceivedDate'],
        'Storage Location': this.TowRowsList[i]['StorageLocation'],
        'Towed From Location': this.TowRowsList[i]['TowedFromLocation']
      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'TowList');
    this.indLoading = false;
  }
  OpenTransfer(template: TemplateRef<any>, obj) {
    this.LoadOperators();
    this.LoadLots();
    this.LoadSpaces(obj.TowingId);
    this.RecordId = obj.RecordId;
    this.TowingId = obj.TowingId;
    this.TowingTransferId = obj.TowingTransferId;
    this.modalTransferRef = this.modalService.show(template, Object.assign({}, this.config, { class: 'gray modal-md' }));


  }
  closeTransferRef() {
    this.modalTransferRef.hide();
  }
  resetOperator(): void {
    setTimeout(() => {
      (this.TransferForm.controls['OperatorFormControl']).setValue(null);
    }, 1);
  }
  filterOperator(val) {
    return val ? this.operators.filter(s => s.DriverName.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.operators;
  }
  displayOperatorFn(operator): string {
    return operator ? operator.DriverName : operator;
  }

  LoadOperators(): void {
    this.transferLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/TowTransfer/GetTowOperator')
      .subscribe(operators => {
        this.operators = operators;
        this.filteredOperators = this.TransferForm.controls['OperatorFormControl'].valueChanges
          .startWith(null)
          .map(operator => operator && typeof operator === 'object' ? operator.DriverName : operator)
          .map(name => this.filterOperator(name));
        this.transferLoading = false;
      },
        error => { this.TransferErrorMsg = <any>error; this.transferLoading = false; });
  }
resetLot(): void {
    setTimeout(() => {

      for (let lot of this.lots) {
        if (lot.Storage_Id == 1) {
          (<FormControl>this.TransferForm.controls['LotFormControl'])
            .setValue(lot, {});
        }
        }
    }, 1);
  }
  filterLot(val) {
    return val ? this.lots.filter(s => s.Location_Name.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.lots;
  }
  displayLotFn(lot): string {
    return lot ? lot.Location_Name : lot;
  }
  
  LoadLots(): void {
    this.transferLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/TowTransfer/GetAuctionLot?isActive=1')
      .subscribe(lots => {
        this.lots = lots;
        this.filteredLots = this.TransferForm.controls['LotFormControl'].valueChanges
          .startWith(null)
          .map(lot => lot && typeof lot === 'object' ? lot.Location_Name : lot)
          .map(name => this.filterLot(name));
          for (let lot of this.lots) {
            if (lot.Storage_Id == 1) {
              (<FormControl>this.TransferForm.controls['LotFormControl'])
                .setValue(lot, {});
            }
            }
          
            this.TransferForm.controls.LotFormControl.disable();
          
        this.transferLoading = false;
      },
        error => { this.TransferErrorMsg = <any>error; this.transferLoading = false; });
  }
  resetSpace(): void {
    setTimeout(() => {
      (this.TransferForm.controls['SpaceFormControl']).setValue(null);
    }, 1);
  }
  filterSpace(val) {
    return val ? this.spaces.filter(s => s.Section_Name.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.spaces;
  }
  displaySpaceFn(space): string {
    return space ? space.Section_Name : space;
  }
  LoadSpaces(tid): void {
    this.transferLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'api/Tow/GetTowSection?StorageId=1&TowingId=' + tid)
      .subscribe(spaces => {
        this.spaces = spaces;
        this.filteredSpaces = this.TransferForm.controls['SpaceFormControl'].valueChanges
          .startWith(null)
          .map(space => space && typeof space === 'object' ? space.Section_Name : space)
          .map(name => this.filterSpace(name));
        this.transferLoading = false;
      },
        error => { this.TransferErrorMsg = <any>error; this.transferLoading = false; });
  }
  Transfer(obj) {
    this.TransferErrorMsg = "";
    this.TransferSuccessMsg = "";
    this.validateAllFormFields(this.TransferForm);
    if (this.TransferForm.valid) {
      this.transferLoading = true;
      
      if (obj.OperatorFormControl) {
        this.UserId = obj.OperatorFormControl.user_id;
      }
      

      var CompleteTransferEntity =
        {
          "TowingTransferId": this.TowingTransferId,
          "TowingId": this.TowingId,
          "SpaceId": obj.SpaceFormControl.Section_Id,
          "OtherSpace": null,
          "AuctionLotId": obj.LotFormControl.Storage_Id,
          "UserId": this.UserId,
        }
        //console.log(CompleteTransferEntity);
        this._dataService.post(Global.DLMS_API_URL + 'api/TowTransfer/CompleteTransfer', CompleteTransferEntity)
        .subscribe(res => {
         // console.log(res);
          this.transferLoading = false;
          this.Search(this.SearchForm.value);
        },
        error => {
          this.transferLoading = false;
          this.TransferErrorMsg = <any>error;
        });
    }
    
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
}
