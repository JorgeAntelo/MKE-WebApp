import { RouterModule, Routes } from "@angular/router";
import { CardpointeHostedFormComponent } from "./cardpointe-hosted-form/cardpointe-hosted-form.component";

const routes: Routes = [
    { path: 'cardpointe-hosted-Form', component: CardpointeHostedFormComponent },
   {
      path: '',
      redirectTo: 'cardpointe-hosted-Form',
      pathMatch: 'full'
   }

];
export const PaymentGateWayRoutes = RouterModule.forChild(routes);