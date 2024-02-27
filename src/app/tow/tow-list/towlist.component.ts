import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { Global } from '../../shared/global';
import { ExcelService } from 'src/app/core/services/excel.service';
import { TowService } from '../Tow.service';

@Component({
    selector: 'towlist',
    templateUrl: './towlist.component.html',
    styleUrls: ['./towlist.component.css']
})
export class TowListComponent implements OnInit {

    indLoading = false;
    LoaderImage: any;
    ErrorMsg: any;
    SuccessMsg: any;
    UserId: Number;
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
    constructor(private _dataService: DataService,
        public towlistService: TowService,
        private excelService: ExcelService) {
    }

    ngOnInit() {
        this.LoaderImage = Global.FullImagePath;
        this.createForm();
        this.Pagenumber = 1;
        this.LoadMake();
        this.LoadTowList(this.SearchForm);
    }

    createForm() {
        this.SearchForm = new FormGroup({
            RecordIdFormControl: new FormControl(''),
            PlateFormControl: new FormControl(''),
            VinFormControl: new FormControl(''),
            MakeFormControl: new FormControl(''),
            IsAllFormControl: new FormControl(0)
        });
    }
    LoadMake(): void {
        this.ErrorMsg = "";
        this._dataService.get(Global.DLMS_API_URL + 'api/Make')
            .subscribe(Makes => {
                this.MakeList = Makes;
            },
                error => {
                    this.ErrorMsg = <any>error
                });

    }
    Search(obj) {
        if (this.SearchForm.valid) {
            this.LoadTowList(obj);
        }
    }
    SelectAll(){
        if (this.SearchForm.valid) {
            this.LoadTowList(this.SearchForm);
        }
    }
    LoadTowList(obj): void {
        this.ErrorMsg = "";
        this.SuccessMsg = "";
        let RecordId = this.SearchForm.controls["RecordIdFormControl"].value ? this.SearchForm.controls["RecordIdFormControl"].value : '';
        let Plate = this.SearchForm.controls["PlateFormControl"].value ? this.SearchForm.controls["PlateFormControl"].value : '';
        let Vin = this.SearchForm.controls["VinFormControl"].value ? this.SearchForm.controls["VinFormControl"].value : '';
        let Make = this.SearchForm.controls["MakeFormControl"].value ? this.SearchForm.controls["MakeFormControl"].value : '';
        let IsAll = this.SearchForm.controls["IsAllFormControl"].value ? 1 : 0;
        
        // let FromDate = this.SearchForm.controls["FromDateFormControl"].value ? (this.SearchForm.controls["FromDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["FromDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["FromDateFormControl"].value.getFullYear() : '';
        // let ToDate = this.SearchForm.controls["ToDateFormControl"].value ? (this.SearchForm.controls["ToDateFormControl"].value.getMonth() + 1) + '-' + this.SearchForm.controls["ToDateFormControl"].value.getDate() + '-' + this.SearchForm.controls["ToDateFormControl"].value.getFullYear() : '';

        this.indLoading = true;
        this._dataService.get(Global.DLMS_API_URL + 'tow/GetTowLotList?PageNum=' + this.Pagenumber +
            "&PageSize=" + this.PageSize +
            '&RecordId=' + RecordId +
            '&Plate=' + Plate +
            '&Vin=' + Vin +
            '&Make=' + Make +
            '&IsAll=' + IsAll)
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
    Clear() {
        this.SearchForm.reset();
        this.LoadTowList(this.SearchForm);
    }
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
                'RecordId': this.TowList[i]['RecordId'].Value,
                'License Plate': this.TowList[i]['Plate'],
                'Vin': this.TowList[i]['VIN'] ,
                'Year': this.TowList[i]['VehYear'],
                'Model': this.TowList[i]['Model'],
                'Vehicle Received Date': this.TowList[i]['VehicleReceivedDate'],
                'Storage Location': this.TowList[i]['StorageLocation'],
                'Towed From Location': this.TowList[i]['TowedFromLocation']
            });
        }
        this.excelService.exportAsExcelFile(Itemexport, 'TowList');
        this.indLoading = false;
    }
}



