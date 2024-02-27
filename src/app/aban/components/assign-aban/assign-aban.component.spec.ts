import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAbanComponent } from './assign-aban.component';

describe('AssignAbanComponent', () => {
  let component: AssignAbanComponent;
  let fixture: ComponentFixture<AssignAbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignAbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignAbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
