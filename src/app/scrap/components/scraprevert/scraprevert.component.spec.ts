import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScraprevertComponent } from './scraprevert.component';

describe('ScraprevertComponent', () => {
  let component: ScraprevertComponent;
  let fixture: ComponentFixture<ScraprevertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScraprevertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScraprevertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
