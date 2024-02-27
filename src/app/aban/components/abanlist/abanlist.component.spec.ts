import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbanlistComponent } from './abanlist.component';

describe('AbanlistComponent', () => {
  let component: AbanlistComponent;
  let fixture: ComponentFixture<AbanlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbanlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbanlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
