import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './components/list/list.component';
const routes: Routes = [
    { path: 'mpdlist', component: ListComponent },
    // { path: 'mpdlist?UserId=', component: ListComponent },
    // { path: 'towlist?UserId=&Ic=', component: TowListComponent },
];
export const MPDTransferListRoutes = RouterModule.forChild(routes);
