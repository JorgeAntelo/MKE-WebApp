import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelabanComponent } from './cancelaban.component';

describe('CancelabanComponent', () => {
  let component: CancelabanComponent;
  let fixture: ComponentFixture<CancelabanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelabanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelabanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
