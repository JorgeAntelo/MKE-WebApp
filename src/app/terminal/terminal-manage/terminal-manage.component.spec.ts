import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalManageComponent } from './terminal-manage.component';

describe('TerminalManageComponent', () => {
  let component: TerminalManageComponent;
  let fixture: ComponentFixture<TerminalManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TerminalManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TerminalManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
