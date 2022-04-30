import { TestBed } from '@angular/core/testing';

import { NgOauth2Service } from './ng-oauth2.service';

describe('NgOauth2Service', () => {
  let service: NgOauth2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgOauth2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
