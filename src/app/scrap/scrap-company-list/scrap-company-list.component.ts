import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';
import { ScrapService } from '../scrap.service';

@Component({
  selector: 'app-scrap-company-list',
  templateUrl: './scrap-company-list.component.html',
  styleUrls: ['./scrap-company-list.component.css']
})
export class ScrapCompanyListComponent implements OnInit, AfterViewInit, OnDestroy {
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  utilService: UtilService;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  CurrentDate = new Date();
  TowConfig: any;
  ScrapCompanyList: any = [];
  webUrl = Global.PoliceURL;
  IsInterval: any;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private utilServiceProvider: UtilService,
    private excelService: ExcelService) {
     
    this.activatedRoute.queryParams.subscribe(params => {
      let LoggeduserId = params.uid;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
    });
    this.utilService = utilServiceProvider;
  }

  ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.Pagenumber = 1;
    this.LoadCompanyList();
  }

  ngAfterViewInit(): void {
    this.setHeight();
  }

  ngOnDestroy(): void {
    clearInterval(this.IsInterval);
  }

  setHeight() {
    // this.IsInterval = setInterval(() => {
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    // }, Global.SetHeightTime);
  }

  LoadCompanyList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'ScrapProcess/GetScrapCompanyList?PageNum=' + this.Pagenumber + "&PageSize=" + this.PageSize)
      .subscribe(items => {
        this.indLoading = false;
        if (items != null) {
          this.ScrapCompanyList = items;

          this.TotalPagenum = this.ScrapCompanyList[0]["TotalPages"];
          this.TotalPageCount = [];
          for (var i = 1; i <= this.TotalPagenum; i++) {
            this.TotalPageCount.push({ Id: i, Description: i });
          }
          if (this.Pagenumber == 1) {
            this.PageId = 1;
          }
          this.TotalRecord = "Total Records Found: " + this.ScrapCompanyList[0]["TotalRecords"];
        }
        else {
          this.ScrapCompanyList = [];
        }
      },
        error => {
          this.indLoading = false;
          this.ErrorMsg = <any>error
        });
  }
  Clear() {
    this.LoadCompanyList();
  }
  onPageChange(PageNumber: any) {
    this.Pagenumber = PageNumber;
    this.PageId = PageNumber;
    this.LoadCompanyList();
  }

  first() {
    if (this.PageId === 'undefined' || this.PageId > 1) {
      this.Pagenumber = 1;
      this.PageId = this.Pagenumber;
      this.LoadCompanyList();
    }
  }

  previous() {
    if (this.PageId != 'undefined') {
      if (this.PageId > 1) {
        this.Pagenumber = this.PageId - 1;
        this.PageId = this.Pagenumber;
        this.LoadCompanyList();
      }
    }
  }

  next() {
    if (this.PageId != 'undefined') {
      if (this.PageId < this.TotalPagenum) {
        this.Pagenumber = this.PageId + 1;
        this.PageId = this.Pagenumber;
        this.LoadCompanyList();
      }
    }
  }

  last() {
    if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
      this.Pagenumber = this.TotalPagenum;
      this.PageId = this.Pagenumber;
      this.LoadCompanyList();
    }

  }

  DownloadExcel() {
    let Itemexport = [];
    for (let i = 0; i < this.ScrapCompanyList.length; i++) {
      Itemexport.push({
        'Company Name': this.ScrapCompanyList[i]['Company Name'],
        'Contact Name': this.ScrapCompanyList[i]['Contact Name'],
        'Address': this.ScrapCompanyList[i]['Address'],
        'City': this.ScrapCompanyList[i]['City'],
        'State': this.ScrapCompanyList[i]['State'],
        'Zip': this.ScrapCompanyList[i]['Zip'],
        'Telephone': this.ScrapCompanyList[i]['Telephone'],
        'Email': this.ScrapCompanyList[i]['Email']
      });
    }
    this.excelService.exportAsExcelFile(Itemexport, 'Scrap Company List');
    this.indLoading = false;
  }

  AddNew(id) {    
    this.router.navigate(['/scrap/addcompany'], { queryParams: { UserId: this.UserId, CompanyId: id } });
  }

  Delete(id) {
    let DeleteModel = {
      CompanyId: id,
      UserId: this.UserId
    }
    this._dataService.post(Global.DLMS_API_URL + 'ScrapProcess/DeleteScrapCompany', DeleteModel)
      .subscribe(res => {
        this.indLoading = false;
        if (res.Id > 0) {
          this.LoadCompanyList();
          this.SuccessMsg = res.result
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
}