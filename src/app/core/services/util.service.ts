import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Headers, RequestOptions } from '@angular/http';
import { BsModalRef } from 'ngx-bootstrap';

@Injectable()
export class UtilService {
  removeColumnList: any = ['TotalRecords', 'TotalPages', 'Towing_Id','StorageStatusId' ];
  public modalRef: BsModalRef;
  public modalRef2: BsModalRef;
  public config = {
    animated: true,
    keyboard: false,
    backdrop: true,
    ignoreBackdropClick: true
  };
  constructor(private httpClient: HttpClient) { }

  getKeys(obj) {
    return Object.keys(obj)
  }

  getType(x) {
    return typeof x;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  getShcemaUploadDocument() {
    return this.httpClient.get("assets/js/DocumentSchemaList.json")
      .map((response: Response) => <any>response);
  }
}
