import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlinePaymentReviewComponent } from './online-payment-review.component';

describe('OnlinePaymentReviewComponent', () => {
  let component: OnlinePaymentReviewComponent;
  let fixture: ComponentFixture<OnlinePaymentReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlinePaymentReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlinePaymentReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
