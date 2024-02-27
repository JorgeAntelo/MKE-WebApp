import { Injectable } from '@angular/core';

@Injectable()
export class ScrapService {

  //removeColumnList: any = ['RowSpace','TotalCount'];  

  constructor() { }

  getKeys(obj){
    return Object.keys(obj)
  }
  
  getType(x) {
    return typeof x;
  }
}
