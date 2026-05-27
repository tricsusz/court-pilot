import { TestBed } from '@angular/core/testing';

import { WaitingUmpiresService } from './waiting-umpires.service';

describe('WaitingUmpiresService', () => {
  let service: WaitingUmpiresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaitingUmpiresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
