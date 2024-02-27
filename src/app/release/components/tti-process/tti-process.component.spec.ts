import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TtiProcessComponent } from './tti-process.component';

describe('TtiProcessComponent', () => {
  let component: TtiProcessComponent;
  let fixture: ComponentFixture<TtiProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TtiProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TtiProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
