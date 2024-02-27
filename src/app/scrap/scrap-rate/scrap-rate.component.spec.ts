import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapRateComponent } from './scrap-rate.component';

describe('ScrapRateComponent', () => {
  let component: ScrapRateComponent;
  let fixture: ComponentFixture<ScrapRateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapRateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
