import { TestBed } from '@angular/core/testing';

import { WaitingServiceJudgesService } from './waiting-service-judges.service';

describe('WaitingServiceJudgesService', () => {
  let service: WaitingServiceJudgesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WaitingServiceJudgesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
