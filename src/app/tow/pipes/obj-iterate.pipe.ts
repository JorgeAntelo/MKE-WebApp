import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objIterate'
})
export class ObjIteratePipe implements PipeTransform {

  transform(value: any, args: any[] = null): any {
    // let val = value!=null?Object.keys(value).map(key => Object.assign({ key }, value[key])):null;
    // let valger = [];
    // valger = Object.keys(value);

    // let myObj = {CountryID: 87944818, ISO2: "do", ISO3: "u", Name: "aliqua sit magna tempor"}
    // let myArr = [];
    // myArr.push(myObj);
    // return myArr;
    let keys = [];
    for (let key in value) {
      keys.push(key);
    }
    return keys;
}

}
