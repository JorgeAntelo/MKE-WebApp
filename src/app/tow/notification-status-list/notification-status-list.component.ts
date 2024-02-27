import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { UtilService } from 'src/app/core/services/util.service';
import { Global } from 'src/app/shared/global';

@Component({
  selector: 'app-notification-status-list',
  templateUrl: './notification-status-list.component.html',
  styleUrls: ['./notification-status-list.component.css']
})
export class NotificationStatusListComponent implements OnInit, AfterViewInit {
  utilService: UtilService;
  indLoading = false;
  LoaderImage: any;
  ErrorMsg: any;
  SuccessMsg: any;
  UserId: Number;
  TowRowsList: any;
  TowColumnsList: any;
  Pagenumber: any;
  PageId: any;
  PageSize = Global.PageSize;
  TotalPagenum: any;
  TotalPageCount: any[];
  TotalRecord: string;
  webUrl = Global.PoliceURL;
  TowingId: number;
  Event: string;
  ErrorMsg1: any;
  subscription: Subscription
  TowList: any;
  IsInterval: any;
  constructor(private _dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private utilServiceProvider: UtilService) {
    this.utilService = utilServiceProvider;
    this.activatedRoute.queryParams.subscribe(params => {
      let LoggeduserId = params.uid;
      if (LoggeduserId) {
        this.UserId = Number(LoggeduserId);
      }
    });
  }
  ngAfterViewInit(): void {
    this.setHeight();
  }

  ngOnInit() {
    this.LoadTowList();
    setInterval(() => {
      this.LoadTowList();
    }, 10000)
  }

  LoadTowList(): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";

    this.indLoading = true;
    this.subscription = this._dataService.get(Global.DLMS_API_URL + 'api/Notification/NotificationStatusList')
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
  setClass(colName) {
    if (colName == 'Online') {
      return 'Online';
    } else if (colName == 'Busy') {
      return 'Busy';
    } else if (colName == 'Force Busy') {
      return 'ForceBusy';
    } else {
      return '';
    }
  }
  setHeight() {
    this.IsInterval = setInterval(() => {
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);
  }
}
