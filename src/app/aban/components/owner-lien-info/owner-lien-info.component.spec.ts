import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerLienInfoComponent } from './owner-lien-info.component';

describe('OwnerLienInfoComponent', () => {
  let component: OwnerLienInfoComponent;
  let fixture: ComponentFixture<OwnerLienInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnerLienInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnerLienInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
