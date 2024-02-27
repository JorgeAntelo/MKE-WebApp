import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenabanComponent } from './tokenaban.component';

describe('TokenabanComponent', () => {
  let component: TokenabanComponent;
  let fixture: ComponentFixture<TokenabanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenabanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenabanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
