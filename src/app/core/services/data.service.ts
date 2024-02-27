import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, ResponseType, ResponseContentType, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/Rx';
import { Global } from '../../../app/shared/global';
import { BsModalRef } from 'ngx-bootstrap';

@Injectable()
export class DataService {
    modalPromptDetailsRef: BsModalRef;
    constructor(private _http: Http) { }

    // get(url: string): Observable<any> {
    //     return this._http.get(url)
    //         .map((response: Response) => <any>response.json())
    //         .catch(this.handleError);
    // }

    get(url: string): Observable<any> {
        let headers = new Headers();
        headers.append(Global.AuthHeaderName, Global.AuthHeaderValue);
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        return this._http.get(url, options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    // post(url: string, model: any): Observable<any> {
    //     let body = JSON.stringify(model);
    //     let headers = new Headers({ 'Content-Type': 'application/json' });
    //     let options = new RequestOptions({ headers: headers });
    //     return this._http.post(url, body, options)
    //         .map((response: Response) => <any>response.json())
    //         .catch(this.handleError);
    // }

    post(url: string, model: any): Observable<any> {
        let body = JSON.stringify(model);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append(Global.AuthHeaderName, Global.AuthHeaderValue);
        let options = new RequestOptions({ headers: headers });
        return this._http.post(url, body, options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    getWithHeader(url: string, headername: any, headervalue: any): Observable<any> {
        let headers = new Headers();
        headers.append(headername, headervalue);
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        return this._http.get(url, options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    postWithHeader(url: string, model: any, headername: any, headervalue: any): Observable<any> {
        let body = JSON.stringify(model);
        let headers = new Headers();
        headers.append(headername, headervalue);
        headers.append('Content-Type', 'application/json');

        let options = new RequestOptions({ headers: headers });
        return this._http.post(url, body, options)
            .map((response: Response) => <any>response.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }
    postAndDownload(url: string, model: any): Observable<any> {
        let body = JSON.stringify(model);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        headers.append(Global.AuthHeaderName, Global.AuthHeaderValue);       
        let options = new RequestOptions({ headers: headers });
        options.responseType = ResponseContentType.Blob;
        return this._http.post(url, body, options)
            .map((response: Response) => <any>response.blob())
            .catch(this.handleError);
       
      }
}