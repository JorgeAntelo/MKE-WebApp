import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertdispatchComponent } from './convertdispatch.component';

describe('ConvertdispatchComponent', () => {
  let component: ConvertdispatchComponent;
  let fixture: ComponentFixture<ConvertdispatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertdispatchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertdispatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
