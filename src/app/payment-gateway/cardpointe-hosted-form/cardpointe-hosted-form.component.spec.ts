import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardpointeHostedFormComponent } from './cardpointe-hosted-form.component';

describe('CardpointeHostedFormComponent', () => {
  let component: CardpointeHostedFormComponent;
  let fixture: ComponentFixture<CardpointeHostedFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardpointeHostedFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardpointeHostedFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
