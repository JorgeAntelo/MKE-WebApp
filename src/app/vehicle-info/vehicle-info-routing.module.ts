import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ForceUnlockAprovalListComponent } from './force-unlock-aproval-list/force-unlock-aproval-list.component';
import { ContactsComponent } from './contacts/contacts.component';

const routes: Routes = [
  { path: 'approval-list', component: ForceUnlockAprovalListComponent },
  { path: 'contacts', component: ContactsComponent },
  {
    path: '',
    redirectTo: 'approval-list',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleInfoRoutingModule { }
