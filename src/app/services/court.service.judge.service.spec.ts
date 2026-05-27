import { TestBed } from '@angular/core/testing';

import { CourtServiceJudgeService } from './court.service.judge.service';

describe('CourtServiceJudgeService', () => {
  let service: CourtServiceJudgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtServiceJudgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
