import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgOauth2Component } from './ng-oauth2.component';

describe('NgOauth2Component', () => {
  let component: NgOauth2Component;
  let fixture: ComponentFixture<NgOauth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgOauth2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
