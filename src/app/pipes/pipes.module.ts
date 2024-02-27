import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObjIteratePipe } from './obj-iterate.pipe';
import { RemoveTableColumPipe } from './remove-table-colum.pipe';

@NgModule({
  imports: [],
  declarations: [
    ObjIteratePipe,
    RemoveTableColumPipe
  ],
  exports: [
    ObjIteratePipe,
    RemoveTableColumPipe
  ]
})
export class PipesModule { }
