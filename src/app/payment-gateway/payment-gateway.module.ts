import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardpointeHostedFormComponent } from './cardpointe-hosted-form/cardpointe-hosted-form.component';
import { PaymentGateWayRoutes } from './payment-gateway.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextMaskModule } from 'angular2-text-mask';

@NgModule({
  imports: [
    CommonModule,
    PaymentGateWayRoutes,
    FormsModule, 
    ReactiveFormsModule,
    TextMaskModule
  ],
  declarations: [CardpointeHostedFormComponent],
  exports:[CardpointeHostedFormComponent]
})
export class PaymentGatewayModule { }
