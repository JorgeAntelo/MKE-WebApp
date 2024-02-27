import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePaymentTransactionComponent } from './update-payment-transaction.component';

describe('UpdatePaymentTransactionComponent', () => {
  let component: UpdatePaymentTransactionComponent;
  let fixture: ComponentFixture<UpdatePaymentTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePaymentTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePaymentTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
