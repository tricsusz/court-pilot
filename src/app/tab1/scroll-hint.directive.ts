import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  NgZone,
  Renderer2
} from '@angular/core';

/** Keep the queue's downward hint in sync with its remaining scroll content. */
@Directive({ selector: '[appScrollHint]' })
export class ScrollHintDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        const section = this.host.nativeElement;
        const list = section.querySelector('ion-list');
        if (!list) return;

        const update = () => {
          const moreBelow =
            list.clientHeight > 0 &&
            list.scrollHeight - list.clientHeight - list.scrollTop > 1;
          if (moreBelow) {
            this.renderer.addClass(section, 'has-more-below');
          } else {
            this.renderer.removeClass(section, 'has-more-below');
          }
        };
        const resize = new ResizeObserver(update);
        const observeSizes = () => {
          resize.disconnect();
          resize.observe(list);
          for (const child of Array.from(list.children)) resize.observe(child);
          update();
        };
        const mutation = new MutationObserver(observeSizes);
        mutation.observe(list, {
          childList: true,
          subtree: true,
          characterData: true
        });
        list.addEventListener('scroll', update, { passive: true });
        observeSizes();
        this.destroyRef.onDestroy(() => {
          resize.disconnect();
          mutation.disconnect();
          list.removeEventListener('scroll', update);
        });
      });
    });
  }
}
