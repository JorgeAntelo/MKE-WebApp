import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicComponentModalComponent } from './dynamic-component-modal.component';

describe('DynamicComponentModalComponent', () => {
  let component: DynamicComponentModalComponent;
  let fixture: ComponentFixture<DynamicComponentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicComponentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicComponentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
