import { RouterModule, Routes } from '@angular/router';
import { CashierActivityComponent } from './cashier-activity/cashier-activity.component';
import { NotificationStatusListComponent } from './notification-status-list/notification-status-list.component';
import { TowActivityComponent } from './tow-activity/tow-activity.component';
import { TowListComponent } from './tow-list/towlist.component';
import { DatesComponent } from './dates/dates.component';
import { TowHealthListComponent } from './towhealthlist/towhealthlist.component';
import { ActivecallsComponent } from './activecalls/activecalls.component';

const routes: Routes = [
   { path: 'towlist', component: TowListComponent },
   { path: 'towactivity', component: TowActivityComponent },
   { path: 'attendantstatuslist', component: NotificationStatusListComponent },
   { path: 'cashieractivity', component: CashierActivityComponent },
   { path: 'dates', component: DatesComponent },
   { path: 'towhealthlist', component: TowHealthListComponent },
   { path: 'activecalls', component: ActivecallsComponent },
   {
      path: '',
      redirectTo: 'towlist',
      pathMatch: 'full'
   }

];
export const TowRoutes = RouterModule.forChild(routes);
