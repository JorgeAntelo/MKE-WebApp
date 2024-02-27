import { Injectable } from '@angular/core';

@Injectable()
export class TowService {

  removeColumnList: any = ['TotalRecords','TotalPages','StorageStatusId','TowingId'];  

  constructor() { }

  getKeys(obj){
    return Object.keys(obj)
  }
  
  getType(x) {
    return typeof x;
  }
}
