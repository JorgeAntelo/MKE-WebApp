import { Component, OnInit, ViewChild, AfterViewInit, TemplateRef, ElementRef, } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Global } from '../../shared/global';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { ExcelService } from 'src/app/core/services/excel.service';
import { TowService } from '../Tow.service';
import { Observable } from 'rxjs/Observable';
import { MatOptionSelectionChange, fadeInContent } from '@angular/material';
declare var window: any;
@Component({
  selector: 'towhealthlist',
  templateUrl: './towhealthlist.component.html',
  styleUrls: ['./towhealthlist.component.css']
})
export class TowHealthListComponent implements OnInit{ 

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
  TowConfig: any;
  TowList: any;

  MakeList = []; filteredMakes: Observable<any[]>;
  ModelList = []; filteredModels: Observable<any[]>;

  webUrl =  Global.PoliceURL;


  constructor(private _dataService: DataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private towlistServiceProvider: TowService,
    private excelService: ExcelService) {
    this.towlistService = towlistServiceProvider;
    // activatedRoute.params.subscribe(val => {
    //     let that = this;
    // });
    // this.activatedRoute.queryParams.subscribe(params => {
    //     let LoggeduserId = params.UserId;
    //     if (LoggeduserId) {
    //         this.UserId = Number(LoggeduserId);
    //     }
    // });
}

ngOnInit() {
    this.LoaderImage = Global.FullImagePath;
    this.createForm();
    this.Pagenumber = 1;
    this.LoadMake(0,0);
    this.LoadTowList(this.SearchForm);
}
createForm() {
        this.SearchForm = new FormGroup({
            RecordIdFormControl: new FormControl(''),
            PlateFormControl: new FormControl(''),
            VinFormControl: new FormControl(''),
            MakeFormControl: new FormControl(),
            IsAllFormControl: new FormControl(0),
            ModelFormControl: new FormControl(),
            YearFormControl: new FormControl(),
            FromDateFormControl: new FormControl(),
            ToDateFormControl: new FormControl(),
            IsScrapFormControl: new FormControl(0),
            IsImpRlsFormControl: new FormControl(0),
        });
    }
  //   LoadMake(): void {
  //     this.ErrorMsg = "";
  //     this._dataService.get(Global.DLMS_API_URL + 'api/Make')
  //         .subscribe(Makes => {
  //             this.MakeList = Makes;
  //         },
  //             error => {
  //                 this.ErrorMsg = <any>error
  //             });

  // }

  LoadMake(makeid, modelid) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Make')
      .subscribe(result => {
        if (result != null && result.length > 0) {
          this.MakeList = result;

          this.filteredMakes = this.SearchForm.controls['MakeFormControl'].valueChanges
            .startWith(null)
            .map(Make => Make && typeof Make === 'object' ? Make.Description : Make)
            .map(name => this.filterMakes(name));
        }
       
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }
  resetMake(): void {
    setTimeout(() => {
      (this.SearchForm.controls['MakeFormControl']).setValue(null);
    }, 1);

    this.resetModel();
  }
  filterMakes(val) {
    return val ? this.MakeList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.MakeList;
  }
  displayFnMake(Make): string {
    return Make ? Make.Description : Make;
  }
  changeMake(ev: MatOptionSelectionChange) {
    
        if (ev.source.selected) 
        {
          this.LoadModel(ev.source.value.Make_Id);
          // let data = this.MakeList.filter((x) => Number(x.Make_Id) == Number(ev.source.value.Make_Id));
          // (<FormControl>this.AbanForm.controls['OtherMakeFormControl']).setValue('', {});
          // if (data[0].Description == 'OTHER') {
          //   this.isOtherMakeVisible = true;
          //   (this.AbanForm.controls['OtherMakeFormControl']).setValidators(Validators.required);
          //   (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();
          // } else {
          //   this.isOtherMakeVisible = false;
          //   (this.AbanForm.controls['OtherMakeFormControl']).setValidators(null);
          //   (this.AbanForm.controls['OtherMakeFormControl']).updateValueAndValidity();
          // }
        }
      }
  LoadModel(MakeId: number) {
    this._dataService.get(Global.DLMS_API_URL + 'api/Model/?MakeId=' + MakeId)
      .subscribe(result => {
        if (result != null && result.length > 0) {
          this.ModelList = result;
          this.filteredModels = this.SearchForm.controls['ModelFormControl'].valueChanges
            .startWith(null)
            .map(Model => Model && typeof Model === 'object' ? Model.Description : Model)
            .map(name => this.filterModels(name));
        }
      },
        error => {
          this.ErrorMsg = <any>error
        });
  }
  filterModels(val) {
    return val ? this.ModelList.filter(s => s.Description.toLowerCase().indexOf(val.toLowerCase()) === 0)
      : this.ModelList;
  }
  resetModel(): void {
    setTimeout(() => {
      (this.SearchForm.controls['ModelFormControl']).setValue(null);
    }, 1);
  }

  displayFnModel(Model): string {
    return Model ? Model.Description : Model;
  }
  Search(obj) {
    if (this.SearchForm.valid) {
        this.LoadTowList(obj);
    }
}
// SelectAll(){
//     if (this.SearchForm.valid) {
//         this.LoadTowList(this.SearchForm);
//     }
// }
  LoadTowList(obj): void {
    this.ErrorMsg = "";
    this.SuccessMsg = "";
    let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
    let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
    let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
    //let Make = this.SearchForm.controls["MakeFormControl"].value ? this.SearchForm.controls["MakeFormControl"].value : '';
    let Make = ''
    debugger;
    if (obj.MakeFormControl !== undefined && obj.MakeFormControl != null) {
      Make = obj.MakeFormControl.Make_Id?obj.MakeFormControl.Make_Id:'';
    }
    //let Model = this.SearchForm.controls["ModelFormControl"].value ? this.SearchForm.controls["ModelFormControl"].value : '';
    let Model = ''
    if (obj.ModelFormControl !== undefined && obj.ModelFormControl != null) {
      Model = obj.ModelFormControl.Model_Id?obj.ModelFormControl.Model_Id:'';
     
    }
    let Year = this.SearchForm.controls["YearFormControl"].value ? this.SearchForm.controls["YearFormControl"].value : '';
    let IsAll = this.SearchForm.controls["IsAllFormControl"].value ? 1 : 0;
    let IsScrap = this.SearchForm.controls["IsScrapFormControl"].value ? 1 : 0;
   let IsImpoundRelease = this.SearchForm.controls["IsImpRlsFormControl"].value ? 1 : 0;
  
    let FromDate = this.SearchForm.controls["FromDateFormControl"].value ? (this.SearchForm.controls["FromDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["FromDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["FromDateFormControl"].value.getFullYear() : '';
    let ToDate = this.SearchForm.controls["ToDateFormControl"].value ? (this.SearchForm.controls["ToDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ToDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ToDateFormControl"].value.getFullYear() : '';

    this.indLoading = true;
    this._dataService.get(Global.DLMS_API_URL + 'tow/GetHealthTowLotList?PageNum=' + this.Pagenumber +
        "&PageSize=" + this.PageSize +
        '&RecordId=' + RecordId +
        '&Plate=' + Plate +
        '&Vin=' + Vin +
        '&Make=' + Make +
        '&Model=' + Model +
        '&Year=' + Year +
        '&FromDate=' + FromDate +
        '&ToDate=' + ToDate +
        '&IsScrap=' + IsScrap +
        '&IsImpoundRelease=' + IsImpoundRelease +
       // '&IsAll=1')
         '&IsAll=' + IsAll)
        .subscribe(items => {
            this.indLoading = false;
            if (items != null)
             {
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
Clear() {
    this.SearchForm.reset();
    this.LoadTowList(this.SearchForm);
}
// Create() {   
// //alert(Global.PoliceURL+ "officer/tabs/vehicleinfotab.aspx?TowMode=New&Type=HealthTow")
//     //window.open(Global.PoliceURL+ "officer/tabs/vehicleinfotab.aspx?TowMode=New&Type=HealthTow", '_parent',  true)
//     this.router.navigateByUrl(Global.WebUrl+ "officer/tabs/vehicleinfotab.aspx?TowMode=New&Type=HealthTow")
// }
onPageChange(PageNumber: any) {
    this.Pagenumber = PageNumber;
    this.PageId = PageNumber;
    this.LoadTowList(this.SearchForm.value);
}

first() {
    if (this.PageId === 'undefined' || this.PageId > 1) {
        this.Pagenumber = 1;
        this.PageId = this.Pagenumber;
        this.LoadTowList(this.SearchForm.value);
    }
}

previous() {
    if (this.PageId != 'undefined') {
        if (this.PageId > 1) {
            this.Pagenumber = this.PageId - 1;
            this.PageId = this.Pagenumber;
            this.LoadTowList(this.SearchForm.value);
        }
    }
}

next() {
    if (this.PageId != 'undefined') {
        if (this.PageId < this.TotalPagenum) {
            this.Pagenumber = this.PageId + 1;
            this.PageId = this.Pagenumber;
            this.LoadTowList(this.SearchForm.value);
        }
    }
}

last() {
    if (this.PageId === 'undefined' || this.PageId < this.TotalPagenum) {
        this.Pagenumber = this.TotalPagenum;
        this.PageId = this.Pagenumber;
        this.LoadTowList(this.SearchForm.value);
    }

}

download() {
  let Itemexport = [];  
  for (let i = 0; i < this.TowList.length; i++) {
      Itemexport.push({
          'RecordId': this.TowList[i]['RecordId'],
          'License Plate': this.TowList[i]['Plate'],
          'Vin': this.TowList[i]['VIN'],
          'Year': this.TowList[i]['Year'],
          'Make': this.TowList[i]['Make'],
          'Model': this.TowList[i]['Model'],
          'Vehicle Received Date': this.TowList[i]['VehicleReceivedDate'],
          // 'Storage Location': this.TowList[i]['StorageLocation'],
          'Towed From Location': this.TowList[i]['TowedFromLocation']
      });
  }
  this.excelService.exportAsExcelFile(Itemexport, 'HealthTowList');
  this.indLoading = false;
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
  checkValidInput(type) {
    setTimeout(() => {
      var obj = this.SearchForm.value;
      if (type == "make") {
        if (obj.MakeFormControl.Make_Id === undefined) {
          this.resetMake();
        }
      }
      else if (type == "model") {
        if (obj.ModelFormControl.Model_Id === undefined) {
          this.resetModel();
        }
      } 
    }, 1000);


  }

}
