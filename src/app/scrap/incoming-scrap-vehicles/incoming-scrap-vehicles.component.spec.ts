import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingScrapVehiclesComponent } from './incoming-scrap-vehicles.component';

describe('IncomingScrapVehiclesComponent', () => {
  let component: IncomingScrapVehiclesComponent;
  let fixture: ComponentFixture<IncomingScrapVehiclesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomingScrapVehiclesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingScrapVehiclesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
