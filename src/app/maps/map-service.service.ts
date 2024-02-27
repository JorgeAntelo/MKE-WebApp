import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapServiceService {
  public ErrorMsg: string = '';
  public SuccessMsg: string = '';
  private subject = new Subject<any>();
  private subjectDriverList = new Subject<any>();
  constructor() { }

  sendClickEvent(data: any) {
    this.subject.next(data);
  }
  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  sendDriverList(data: any) {
    this.subjectDriverList.next(data);
  }
  getDriverList(): Observable<any> {
    return this.subjectDriverList.asObservable();
  }
}
