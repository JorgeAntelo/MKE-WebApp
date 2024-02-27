import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './components/list/list.component';
import { MPDTransferListRoutes } from './mpdtransfers.routes';
import { MpdtransfersService } from './mpdtransfers.service';
import { MaterialModule } from '../modules/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Pipe, PipeTransform } from '@angular/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MPDTransferListRoutes,
    MaterialModule,
  ],
  declarations: [ListComponent],
  providers: [MpdtransfersService]
})
export class MpdtransfersModule { }
