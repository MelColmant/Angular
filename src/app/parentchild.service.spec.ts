import { TestBed } from '@angular/core/testing';

import { ParentchildService } from './parentchild.service';

describe('ParentchildService', () => {
  let service: ParentchildService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParentchildService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
