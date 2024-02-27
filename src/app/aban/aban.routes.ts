import { RouterModule, Routes } from '@angular/router';
import { AbanlistComponent } from './components/abanlist/abanlist.component';
import { AbanComponent } from './components/aban/aban.component';
import { NotifyOwnerLienComponent } from './components/notify-owner-lien/notify-owner-lien.component';
import { ComplaintComponent } from './components/complaint/complaint.component';
import { SearchComponent } from './components/search/search.component';
import { TokenabanComponent } from './components/tokenaban/tokenaban.component';
import { CitizenabanComponent } from './components/citizenaban/citizenaban.component';
import { AbanlistaltComponent } from './components/abanlistalt/abanlistalt.component';
const routes: Routes = [
    { path: 'abanlist', component: AbanlistComponent },
    { path: 'abanlist?UserId=&Ic=', component: AbanlistComponent },
    { path: 'abanlist?UserId=&Ic=&Ia', component: AbanlistComponent },
    { path: 'aban', component: AbanComponent },
    { path: 'aban?Id=&UserId=&Ic=', component: AbanComponent },
    { path: 'aban?Id=&UserId=&Ic=&Ia=', component: AbanComponent },
    { path: 'aban?Id=&UserId=&Ic=&Token=&Ia=', component: AbanComponent },
    { path: 'notifyownerlien', component: NotifyOwnerLienComponent },
    { path: 'complaint', component: ComplaintComponent },
    { path: 'complaint?compno=', component: ComplaintComponent },
    { path: 'search', component: SearchComponent },
    { path: 'search?Ic=', component: SearchComponent },
    { path: 'tokenaban', component: TokenabanComponent },
    { path: 'tokenaban?Id=&UserId=&Ic=&Token=&Ia=', component: TokenabanComponent },
    { path: 'citizenaban', component: CitizenabanComponent },
    { path: 'citizenaban?Id=&UserId=&Ic=&Token=&Ia=', component: CitizenabanComponent },
    { path: 'abanlistalt', component: AbanlistaltComponent },
    { path: 'abanlistalt?UserId=&Ic=', component: AbanlistaltComponent },
    { path: 'abanlistalt?UserId=&Ic=&Ia', component: AbanlistaltComponent },

];
export const AbanRoutes = RouterModule.forChild(routes);
