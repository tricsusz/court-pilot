import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationKey, TranslationParams } from './translations';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: TranslationKey, params: TranslationParams = {}): string {
    return this.translationService.translate(key, params);
  }
}
