import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleInfoRoutingModule } from './vehicle-info-routing.module';
import { ForceUnlockAprovalListComponent } from './force-unlock-aproval-list/force-unlock-aproval-list.component';
import { VehicleInfoService } from './vehicle-info-services';
import { ContactsComponent } from './contacts/contacts.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';
import { PipesModule } from '../pipes/pipes.module';
import { MaterialModule } from '../modules/material/material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    VehicleInfoRoutingModule,
    TextMaskModule,
    MaterialModule,
    PipesModule
  ],
  declarations: [ForceUnlockAprovalListComponent, ContactsComponent],
  providers: [VehicleInfoService]
})
export class VehicleInfoModule { }
