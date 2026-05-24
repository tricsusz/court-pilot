import { TestBed } from '@angular/core/testing';

import { UmpireService } from './umpire.service';

describe('Umpire', () => {
  let service: UmpireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UmpireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
