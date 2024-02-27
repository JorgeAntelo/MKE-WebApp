import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapCompanyComponent } from './scrap-company.component';

describe('ScrapCompanyComponent', () => {
  let component: ScrapCompanyComponent;
  let fixture: ComponentFixture<ScrapCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
