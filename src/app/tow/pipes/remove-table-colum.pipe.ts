import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeTableColum'
})
export class RemoveTableColumPipe implements PipeTransform {

  transform(items: any[], filters?: any[]): any { 
    filters.forEach(filter => {
      let index = items.indexOf(filter);
      if (index > -1) {
      items.splice(index, 1);
      }
    });
    return items;
    
  }


}
