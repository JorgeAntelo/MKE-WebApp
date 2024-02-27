import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrapeligiblelistComponent } from './scrapeligiblelist.component';

describe('ScrapeligiblelistComponent', () => {
  let component: ScrapeligiblelistComponent;
  let fixture: ComponentFixture<ScrapeligiblelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrapeligiblelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrapeligiblelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
