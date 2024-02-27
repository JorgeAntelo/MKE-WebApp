import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbanlistaltComponent } from './abanlistalt.component';

describe('AbanlistaltComponent', () => {
  let component: AbanlistaltComponent;
  let fixture: ComponentFixture<AbanlistaltComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbanlistaltComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbanlistaltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
