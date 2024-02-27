import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbanComponent } from './aban.component';

describe('AbanComponent', () => {
  let component: AbanComponent;
  let fixture: ComponentFixture<AbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
