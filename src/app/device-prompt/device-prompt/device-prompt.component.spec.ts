import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePromptComponent } from './device-prompt.component';

describe('DevicePromptComponent', () => {
  let component: DevicePromptComponent;
  let fixture: ComponentFixture<DevicePromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
