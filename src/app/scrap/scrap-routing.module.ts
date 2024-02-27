import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScrapeligiblelistComponent } from './components/scrapeligiblelist/scrapeligiblelist.component';
import { IncomingScrapVehiclesComponent } from './incoming-scrap-vehicles/incoming-scrap-vehicles.component';
import { ScrapCompanyListComponent } from './scrap-company-list/scrap-company-list.component';
import { ScrapCompanyComponent } from './scrap-company/scrap-company.component';
import { ScrapRateComponent } from './scrap-rate/scrap-rate.component';
import { ScrapreleasesComponent } from './components/scrapreleases/scrapreleases.component';
// import { ScraprevertComponent } from './components/scraprevert/scraprevert.component';
const routes: Routes = [
  { path: 'scrapeligiblelist', component: ScrapeligiblelistComponent },
  { path: 'scrapcompany', component: ScrapCompanyListComponent },
  { path: 'addcompany', component: ScrapCompanyComponent },
  { path: 'scraprate', component: ScrapRateComponent },
  { path: 'incomingscrapvehicles', component: IncomingScrapVehiclesComponent },
  { path: 'scrapreleases', component: ScrapreleasesComponent },
  // { path: 'scraprevert', component: ScraprevertComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScrapRoutingModule { }
