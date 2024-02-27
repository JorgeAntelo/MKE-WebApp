import { PaymentGatewayModule } from './payment-gateway.module';

describe('PaymentGatewayModule', () => {
  let paymentGatewayModule: PaymentGatewayModule;

  beforeEach(() => {
    paymentGatewayModule = new PaymentGatewayModule();
  });

  it('should create an instance', () => {
    expect(paymentGatewayModule).toBeTruthy();
  });
});
