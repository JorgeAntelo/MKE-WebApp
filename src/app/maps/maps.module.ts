import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MapsRoutingModule } from './maps-routing.module';
import { MapComponent } from './map/map.component';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { Global } from '../shared/global';
import { OperatorsComponent } from './operators/operators.component';
import { DriverListComponent } from './driver-list/driver-list.component';

@NgModule({
  imports: [
    CommonModule,
    MapsRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AgmCoreModule.forRoot({
      apiKey: Global.GoogleMapAPIKey,
      libraries: ['places']
    })
  ],
  declarations: [MapComponent, OperatorsComponent, DriverListComponent],
  providers:[DatePipe]
})
export class MapsModule { }
