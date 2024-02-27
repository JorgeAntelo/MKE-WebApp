import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivecallsComponent } from './activecalls.component';

describe('ActivecallsComponent', () => {
  let component: ActivecallsComponent;
  let fixture: ComponentFixture<ActivecallsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivecallsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivecallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
