import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TowActivityComponent } from './tow-activity.component';

describe('TowActivityComponent', () => {
  let component: TowActivityComponent;
  let fixture: ComponentFixture<TowActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TowActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TowActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
