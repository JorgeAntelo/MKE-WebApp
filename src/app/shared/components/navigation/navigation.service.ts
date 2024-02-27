import { Injectable } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Observable } from 'rxjs/Rx';
import { Global } from '../../../shared/global';
import { LocalStorageService } from 'angular-2-local-storage';
import { MAT_CHECKBOX_CONTROL_VALUE_ACCESSOR } from '@angular/material';

@Injectable()
export class NavigationService {
    constructor(private _dataService: DataService
        , private localStorageService: LocalStorageService) {
       
    }
}