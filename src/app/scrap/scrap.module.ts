import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

import { ScrapRoutingModule } from './scrap-routing.module';
import { ScrapService } from './scrap.service';
import { ScrapeligiblelistComponent } from './components/scrapeligiblelist/scrapeligiblelist.component';
import { MaterialModule } from '../modules/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrapCompanyListComponent } from './scrap-company-list/scrap-company-list.component';
import { ScrapCompanyComponent } from './scrap-company/scrap-company.component';
import { PipesModule } from '../pipes/pipes.module';
import { TextMaskModule } from 'angular2-text-mask';
import { ScrapRateComponent } from './scrap-rate/scrap-rate.component';
import { IncomingScrapVehiclesComponent } from './incoming-scrap-vehicles/incoming-scrap-vehicles.component';
import { ScrapreleasesComponent } from './components/scrapreleases/scrapreleases.component';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { Global } from 'src/app/shared/global';
import { ScraprevertComponent } from './components/scraprevert/scraprevert.component';
@NgModule({
  imports: [
    CommonModule,
    ScrapRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    PipesModule,
    TextMaskModule,
    AgmCoreModule.forRoot({
      apiKey: Global.GoogleMapAPIKey,
      libraries: ["places"]
    }),
  ],
  declarations: [
    ScrapeligiblelistComponent,
    ScrapCompanyListComponent,
    ScrapCompanyComponent,
    ScrapRateComponent,
    IncomingScrapVehiclesComponent,
    ScrapreleasesComponent,
    ScraprevertComponent
  ],
  providers: [ScrapService, DatePipe, CurrencyPipe]
})
export class ScrapModule { }
