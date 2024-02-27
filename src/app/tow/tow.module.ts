import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TowListComponent } from './tow-list/towlist.component';
import { TowService } from './Tow.service';
import { RemoveTableColumPipe } from './pipes/remove-table-colum.pipe';
import { ObjIteratePipe } from './pipes/obj-iterate.pipe';
import { MaterialModule } from '../modules/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TowActivityComponent } from './tow-activity/tow-activity.component';
import { TowRoutes } from './tow.routes';
import { NotificationStatusListComponent } from './notification-status-list/notification-status-list.component';
import { PipesModule } from '../pipes/pipes.module';
import { CashierActivityComponent } from './cashier-activity/cashier-activity.component';
import { DatesComponent } from './dates/dates.component';
import { TowHealthListComponent } from './towhealthlist/towhealthlist.component';
import { OnlinePaymentReviewComponent } from './online-payment-review/online-payment-review.component';
import { ActivecallsComponent } from './activecalls/activecalls.component';
import { AgmCoreModule } from '@agm/core';
import { Global } from '../shared/global';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TowRoutes,
    MaterialModule,
    PipesModule,
    AgmCoreModule.forRoot({
      apiKey: Global.GoogleMapAPIKey,
      libraries: ['places']
    })

  ],
  declarations: [
    TowListComponent,
    RemoveTableColumPipe,
    ObjIteratePipe,
    TowActivityComponent,
    NotificationStatusListComponent,
    CashierActivityComponent,
    DatesComponent,
    TowHealthListComponent,
    OnlinePaymentReviewComponent,
    ActivecallsComponent
  ],
  providers: [TowService],
  exports: [OnlinePaymentReviewComponent]
})
export class TowModule { }
