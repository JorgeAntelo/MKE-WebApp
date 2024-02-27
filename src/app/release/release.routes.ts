import { RouterModule, Routes } from '@angular/router';
import { ConfigurationRateComponent } from './components/configurationrate.component';
import { DevicePromptComponent } from './components/device-prompt/device-prompt.component';
import { DispositionComponent } from './components/disposition.component';
import { DispositionCartComponent } from './components/dispositioncart.component';
import { OnlinepaymentlistComponent } from './components/onlinepaymentlist.component';
import { SearchcitationsComponent } from './components/searchcitations.component';

const routes: Routes = [
    { path: 'configurationrate', component: ConfigurationRateComponent },
    { path: 'disposition', component: DispositionComponent },
    { path: 'onlinepaymentlist', component: OnlinepaymentlistComponent },
    { path: 'dispositioncart', component: DispositionCartComponent },
    { path: 'searchcitations', component: SearchcitationsComponent },
    { path: 'deviceprompt', component: DevicePromptComponent }
];
export const ReleaseRoutes = RouterModule.forChild(routes);