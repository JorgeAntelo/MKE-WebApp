import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/services/data.service';
import { ExcelService } from 'src/app/core/services/excel.service';
import { Global } from 'src/app/shared/global';
import { TowService } from '../Tow.service';

@Component({
  selector: 'app-cashier-activity',
  templateUrl: './cashier-activity.component.html',
  styleUrls: ['./cashier-activity.component.css']
})
export class CashierActivityComponent implements OnInit,AfterViewInit {
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
  RoleId: any;
  IsInterval: any;
  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private towlistServiceProvider: TowService,
    private excelService: ExcelService) { 
      this.towlistService = towlistServiceProvider;
    }
  
    ngOnInit() {
      this.activatedRoute.queryParams.subscribe(params => {
        this.PageId = params.PageId;
        this.RoleId = params.RoleId;
        this.UserId = params.uid;
      });
      this.LoaderImage = Global.FullImagePath;
      this.Pagenumber = 1;
      this.createForm();
      this.LoadTowList(this.SearchForm);
      setInterval( ()=>{
        this.LoadTowList(this.SearchForm);
      },15000);
  }
  ngAfterViewInit(): void {
    this.setHeight()
  }
  setHeight() {
    this.IsInterval = setInterval(() => {
      window.top.postMessage(document.body.scrollHeight, Global.PoliceURL);
    }, Global.SetHeightTime);
  }
  createForm() {
    this.SearchForm = new FormGroup({
      StatusFormControl: new FormControl(''),
    });
  }
  Search(obj) {
          this.LoadTowList(obj);
  }
  LoadTowList(obj): void {
      this.ErrorMsg = "";
      this.SuccessMsg = "";
      let status =this.SearchForm.getRawValue().StatusFormControl?this.SearchForm.getRawValue().StatusFormControl:0;
      this.indLoading = true;
      this.subscription= this._dataService.get(Global.DLMS_API_URL + 'api/Cashiering/SelectCashierActivityList?UserId='+this.UserId+'&Status='+status)
          .subscribe(items => {
              this.indLoading = false;
              if (items != null) {
                  this.TowList = items;
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
    if (item.Status =='Closed') {
      return 'bn-red bn-redblock';
    } else if (item.Status =='Assigned') {
      return 'bn-greenblock';
    }else{
      return 'bn-orangblock';
    }
  }
  Clear(){
    this.SearchForm.reset();
    this.LoadTowList(this.SearchForm);
  }
  
}

