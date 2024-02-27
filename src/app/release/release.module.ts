import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReleaseRoutes } from './release.routes';
import { FormsModule, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from "@angular/material";
import { MaterialModule } from '../modules/material/material.module';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
// import { FlexLayoutModule } from '@angular/flex-layout';
import { TimepickerModule } from 'ngx-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { RouterModule } from '@angular/router';
// import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
// import { } from '@types/googlemaps';
import { Global } from '../shared/global';
import { ConfigurationRateComponent } from './components/configurationrate.component';
import { DispositionComponent } from './components/disposition.component';
import { DispositionCartComponent } from './components/dispositioncart.component';
import { OnlinepaymentlistComponent } from './components/onlinepaymentlist.component';
import { ReleaseChecklistComponent} from './components/releasechecklist/releasechecklist.component';
import { PermitComponent } from './components/permit/permit.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CitationsComponent } from './components/citations/citations.component';
import { DMVComponent } from './components/dmv/dmv.component';
import { SearchcitationsComponent } from './components/searchcitations.component';
import { RefundComponent } from './components/refund/refund.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { DataTableModule } from 'angular-6-datatable';
import { AdditionalPaymentComponent } from './components/additionalpayment/additionalpayment.component';
import { ReleaseToInscChecklistComponent } from './components/releasetoinsuchecklist/releasetoinsuchecklist.component';
import { TtiProcessComponent } from './components/tti-process/tti-process.component';
import { UpdatePaymentTransactionComponent } from './components/update-payment-transaction/update-payment-transaction.component';
import { PaymentPlanComponent } from './components/payment-plan/payment-plan.component';
import { PermitTestComponent } from './components/permit_test/permit_test.component';
import { PipesModule } from '../pipes/pipes.module';
import { NewPaymentComponent } from './components/new-payment/new-payment.component';
import { NgxSelectModule } from 'ngx-select-ex';
import { DevicePromptComponent } from './components/device-prompt/device-prompt.component';
import { MultiCardPaymentComponent } from './components/multi-card-payment/multi-card-payment.component';
import { NoDblClickDirective } from '../no-dbl-click.directive';
import { TowModule } from '../tow/tow.module';

@NgModule({
    imports: [
        CommonModule,
        ReleaseRoutes,
        FormsModule, ReactiveFormsModule,
        MatNativeDateModule,
        //FlexLayoutModule,
        RouterModule,
        // AngularMultiSelectModule,
        TextMaskModule,
        MaterialModule,
        TimepickerModule.forRoot(),
        AgmCoreModule.forRoot({
            apiKey: Global.GoogleMapAPIKey,
            libraries: ["places"]
        }),
        DataTableModule,
        PipesModule,
        NgxSelectModule,
        TowModule
    ],
    declarations: [
        ConfigurationRateComponent,
        ReleaseChecklistComponent,
        ReleaseToInscChecklistComponent,
        DispositionComponent,
        OnlinepaymentlistComponent,
        DispositionCartComponent,
        SearchcitationsComponent,
        PermitComponent,
        PaymentComponent,
        CitationsComponent,
        DMVComponent,
        RefundComponent,
        DocumentsComponent,
        AdditionalPaymentComponent,
        TtiProcessComponent,
        UpdatePaymentTransactionComponent,
        PaymentPlanComponent,
        PermitTestComponent,
        NewPaymentComponent,
        DevicePromptComponent,
        MultiCardPaymentComponent,
        NoDblClickDirective
    ],
    entryComponents: [ReleaseChecklistComponent]
    //providers:[DatePipe]
})

export class ReleaseModule { }