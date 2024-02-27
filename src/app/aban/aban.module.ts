import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AbanComponent } from './components/aban/aban.component';
import { AbanlistComponent } from './components/abanlist/abanlist.component';
import { AbanRoutes } from './aban.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from "@angular/material";
import { MaterialModule } from '../modules/material/material.module';
import { TimepickerModule } from 'ngx-bootstrap';
import { OwnerLienInfoComponent } from './components/owner-lien-info/owner-lien-info.component';
import { AgmCoreModule } from '@agm/core';
import { Global } from '../shared/global';
import { NotifyOwnerLienComponent } from './components/notify-owner-lien/notify-owner-lien.component';
import { TextMaskModule } from 'angular2-text-mask';
import { CancelabanComponent } from './components/cancelaban/cancelaban.component';
import { ConfirmabanComponent } from './components/confirmaban/confirmaban.component';
import { AssignAbanComponent } from './components/assign-aban/assign-aban.component';
import { ComplaintComponent } from './components/complaint/complaint.component';
import { SearchComponent } from './components/search/search.component';
import { TokenabanComponent } from './components/tokenaban/tokenaban.component';
import { CitizenabanComponent } from './components/citizenaban/citizenaban.component';
import { AbanlistaltComponent } from './components/abanlistalt/abanlistalt.component';
import { EventinfoComponent } from './components/eventinfo/eventinfo.component';
import { ConvertdispatchComponent } from './components/convertdispatch/convertdispatch.component';
import { CitationissuedComponent } from './components/citationissued/citationissued.component';
import { AuditinfoComponent } from './components/auditinfo/auditinfo.component';
import { DataTableModule } from 'angular-6-datatable';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatNativeDateModule, FormsModule, ReactiveFormsModule,
    TimepickerModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: Global.GoogleMapAPIKey,
      libraries: ['places']
    }),
    MaterialModule, TextMaskModule,
    AbanRoutes,
    DataTableModule
  ],
  declarations: [
    AbanComponent,
    AbanlistComponent,
    OwnerLienInfoComponent,
    NotifyOwnerLienComponent,
    CancelabanComponent,
    ConfirmabanComponent,
    AssignAbanComponent,
    ComplaintComponent,
    SearchComponent,
    TokenabanComponent,
    CitizenabanComponent,
    AbanlistaltComponent,
    EventinfoComponent,
    ConvertdispatchComponent,
    CitationissuedComponent,
    AuditinfoComponent
  ]
})
export class AbanModule { }
