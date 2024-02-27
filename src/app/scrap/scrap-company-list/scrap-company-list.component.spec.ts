import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapCompanyListComponent } from './scrap-company-list.component';

describe('ScrapCompanyListComponent', () => {
  let component: ScrapCompanyListComponent;
  let fixture: ComponentFixture<ScrapCompanyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapCompanyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapCompanyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
