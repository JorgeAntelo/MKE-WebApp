import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Global } from '../../../app/shared/global';
import { LocalStorageService } from 'angular-2-local-storage';
import { NgModule } from '@angular/core';
//import { NavigationService } from '../../shared/components/navigation/navigation.service';

@Injectable()
export class AuthenticationService {
    constructor(private http: Http, private localStorageService: LocalStorageService//,public nav: NavigationService
    ) { }

}