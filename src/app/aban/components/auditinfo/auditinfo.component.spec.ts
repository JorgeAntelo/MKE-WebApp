import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditinfoComponent } from './auditinfo.component';

describe('AuditinfoComponent', () => {
  let component: AuditinfoComponent;
  let fixture: ComponentFixture<AuditinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
