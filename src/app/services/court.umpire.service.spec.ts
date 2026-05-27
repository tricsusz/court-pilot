import { TestBed } from '@angular/core/testing';

import { CourtUmpireService } from './court.umpire.service';

describe('CourtUmpireService', () => {
  let service: CourtUmpireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourtUmpireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
