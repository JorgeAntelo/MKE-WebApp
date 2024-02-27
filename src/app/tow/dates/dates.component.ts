import { Component, OnInit, OnDestroy } from '@angular/core';
import { Global } from 'src/app/shared/global';
import { DataService } from 'src/app/core/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'dateslist',
    templateUrl: './dates.component.html',
    styleUrls: ['./dates.component.css']
})

export class DatesComponent implements OnInit {
    indLoading = false;
    LoaderImage: any;
    ErrorMsg: any;
    SuccessMsg: any;    
    DatesList: any;
    TowingId: Number;
   
    constructor(private _dataService: DataService,
        private router: Router,
        private activatedRoute: ActivatedRoute,       
       ) {
        this.activatedRoute.queryParams.subscribe(params => {
                let towId = params.TowingId;
                if (towId) {
                    this.TowingId = Number(towId);
                }
            });
       
    }
    ngOnInit() {
        this.LoaderImage = Global.FullImagePath;    
        this.LoadDatesList();
    }

    LoadDatesList(): void {
        this.ErrorMsg = "";
        this.SuccessMsg = "";
       
        this.indLoading = true;
        this._dataService.get(Global.DLMS_API_URL + 'tow/GetDates?Towingid=' + this.TowingId)
            .subscribe(items => {
                this.indLoading = false;
                if (items != null) {
                    this.DatesList = items;                   
                }
                else {
                    this.DatesList = [];
                }
            },
                error => {
                    this.indLoading = false;
                    this.ErrorMsg = <any>error
                });
    }
}