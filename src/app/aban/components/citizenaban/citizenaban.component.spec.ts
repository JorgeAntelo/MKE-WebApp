import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitizenabanComponent } from './citizenaban.component';

describe('CitizenabanComponent', () => {
  let component: CitizenabanComponent;
  let fixture: ComponentFixture<CitizenabanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitizenabanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitizenabanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
