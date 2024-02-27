import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapreleasesComponent } from './scrapreleases.component';

describe('ScrapreleasesComponent', () => {
  let component: ScrapreleasesComponent;
  let fixture: ComponentFixture<ScrapreleasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapreleasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapreleasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
