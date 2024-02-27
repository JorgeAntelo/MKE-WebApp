import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierActivityComponent } from './cashier-activity.component';

describe('CashierActivityComponent', () => {
  let component: CashierActivityComponent;
  let fixture: ComponentFixture<CashierActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashierActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashierActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
