import { Component, OnInit, OnDestroy } from '@angular/core';
import { Global } from 'src/app/shared/global';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ExcelService } from 'src/app/core/services/excel.service';
import { FormGroup, FormControl } from '@angular/forms';
import { TowService } from '../Tow.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-tow-activity',
  templateUrl: './tow-activity.component.html',
  styleUrls: ['./tow-activity.component.css']
})
export class TowActivityComponent implements OnInit,OnDestroy {
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  towlistService: TowService;
  TowRowsList: any;
  TowColumnsList: any;
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
  TowList: any;
  webUrl =  Global.PoliceURL;
  subscription: Subscription;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private towlistServiceProvider: TowService,
    private excelService: ExcelService) { 
      this.towlistService = towlistServiceProvider;
    }

    ngOnInit() {
      this.LoaderImage = Global.FullImagePath;
      this.Pagenumber = 1;
      this.LoadTowList(this.SearchForm);
      setInterval( ()=>{
        this.LoadTowList(this.SearchForm);
      },15000);
     
  }

  Search(obj) {
      if (this.SearchForm.valid) {
          this.LoadTowList(obj);
      }
  }
  LoadTowList(obj): void {
      this.ErrorMsg = "";
      this.SuccessMsg = "";
     
      this.indLoading = true;
      this.subscription= this._dataService.get(Global.DLMS_API_URL + 'tow/SelectTowActivityList')
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
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setRowClass(item) {
    if (item.User) {
      return 'bn-greenblock';
    } else {
      return 'bn-red bn-redblock';
    }
  }
}
