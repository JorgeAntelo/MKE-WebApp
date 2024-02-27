import { RouterModule, Routes } from '@angular/router';
import { TerminalListComponent } from './terminal-list/terminal-list.component';
import { TerminalManageComponent } from './terminal-manage/terminal-manage.component';


const routes: Routes = [
    { path: 'terminalmanage', component: TerminalManageComponent },
    { path: 'terminallist', component: TerminalListComponent },
   {
      path: '',
      redirectTo: 'terminallist',
      pathMatch: 'full'
   }

];
export const TerminalRoutes = RouterModule.forChild(routes);
