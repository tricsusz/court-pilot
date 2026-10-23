import { TestBed } from '@angular/core/testing';
import { FullnamePipe } from './fullname-pipe';

describe('FullnamePipePipe', () => {
  it('create an instance', () => {
    const pipe = TestBed.runInInjectionContext(() => new FullnamePipe());
    expect(pipe).toBeTruthy();
  });
});
