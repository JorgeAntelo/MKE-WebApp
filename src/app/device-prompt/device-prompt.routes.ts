import { RouterModule, Routes } from '@angular/router';
import { DevicePromptComponent } from './device-prompt/device-prompt.component';


const routes: Routes = [
    { path: 'deviceprompt', component: DevicePromptComponent },
   {
      path: '',
      redirectTo: 'deviceprompt',
      pathMatch: 'full'
   }

];
export const DevicePromptRoutes = RouterModule.forChild(routes);
