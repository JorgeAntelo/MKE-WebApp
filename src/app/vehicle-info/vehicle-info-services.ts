import { Injectable } from '@angular/core';

@Injectable()
export class VehicleInfoService {

  removeColumnList: any = ['TotalRecords','TotalPages'];  

  constructor() { }

  getKeys(obj){
    return Object.keys(obj)
  }
  
  getType(x) {
    return typeof x;
  }
}
