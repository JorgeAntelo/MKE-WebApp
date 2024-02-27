import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForceUnlockAprovalListComponent } from './force-unlock-aproval-list.component';

describe('ForceUnlockAprovalListComponent', () => {
  let component: ForceUnlockAprovalListComponent;
  let fixture: ComponentFixture<ForceUnlockAprovalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForceUnlockAprovalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForceUnlockAprovalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
