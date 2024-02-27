import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiCardPaymentComponent } from './multi-card-payment.component';

describe('MultiCardPaymentComponent', () => {
  let component: MultiCardPaymentComponent;
  let fixture: ComponentFixture<MultiCardPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiCardPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiCardPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
