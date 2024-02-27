import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmabanComponent } from './confirmaban.component';

describe('ConfirmabanComponent', () => {
  let component: ConfirmabanComponent;
  let fixture: ComponentFixture<ConfirmabanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmabanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmabanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
