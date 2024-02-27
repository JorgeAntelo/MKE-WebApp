import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationissuedComponent } from './citationissued.component';

describe('CitationissuedComponent', () => {
  let component: CitationissuedComponent;
  let fixture: ComponentFixture<CitationissuedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitationissuedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitationissuedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
