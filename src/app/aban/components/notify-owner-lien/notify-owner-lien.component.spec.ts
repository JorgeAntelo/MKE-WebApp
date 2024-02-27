import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifyOwnerLienComponent } from './notify-owner-lien.component';

describe('NotifyOwnerLienComponent', () => {
  let component: NotifyOwnerLienComponent;
  let fixture: ComponentFixture<NotifyOwnerLienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotifyOwnerLienComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifyOwnerLienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
