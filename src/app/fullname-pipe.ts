import { Pipe, PipeTransform } from '@angular/core';
import { Umpire } from 'db';

@Pipe({
  name: 'fullname',
  standalone: true
})
export class FullnamePipe implements PipeTransform {
  transform(value: Umpire, ...args: unknown[]): string {
    // TODO: in case of multilang, change here
    return value.lastName + ' ' + value.firstName;
  }
}
