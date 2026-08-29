import { inject, Pipe, PipeTransform } from '@angular/core';
import { Umpire } from 'db';
import { TranslationService } from './i18n/translation.service';

@Pipe({
  name: 'fullname',
  standalone: true,
  pure: false
})
export class FullnamePipe implements PipeTransform {
  readonly translationService = inject(TranslationService);

  transform(value: Umpire | undefined, ...args: unknown[]): string {
    if (typeof value === 'undefined') {
      return '';
    }

    if (this.translationService.language() === 'en') {
      return value.firstName + ' ' + value.lastName;
    }

    return value.lastName + ' ' + value.firstName;
  }
}
