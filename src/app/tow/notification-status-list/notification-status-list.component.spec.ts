import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationStatusListComponent } from './notification-status-list.component';

describe('NotificationStatusListComponent', () => {
  let component: NotificationStatusListComponent;
  let fixture: ComponentFixture<NotificationStatusListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationStatusListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
