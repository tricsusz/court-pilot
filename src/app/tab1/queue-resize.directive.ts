import {
  afterNextRender,
  DestroyRef,
  Directive,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';

@Directive({ selector: '[appQueueResize]' })
export class QueueResizeDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private stopDragging?: () => void;

  constructor() {
    afterNextRender(() => {
      const observer = new MutationObserver(() => {
        this.stopDragging?.();
        for (const queue of this.host.nativeElement.querySelectorAll<HTMLElement>(
          '.official-queue'
        )) {
          queue.style.removeProperty('flex');
        }
      });
      observer.observe(this.host.nativeElement, { childList: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
    this.destroyRef.onDestroy(() => this.stopDragging?.());
  }

  private pair(
    target: EventTarget | null
  ): [HTMLElement, HTMLElement] | undefined {
    if (!(target instanceof HTMLElement)) return;
    const handle = target.closest<HTMLElement>('.queue-resizer');
    const before = handle?.previousElementSibling;
    const after = handle?.nextElementSibling;
    if (!(before instanceof HTMLElement) || !(after instanceof HTMLElement))
      return;
    return [before, after];
  }

  private adjust(before: HTMLElement, after: HTMLElement, delta: number): void {
    const queues = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.official-queue')
    );
    const heights = queues.map((queue) => queue.getBoundingClientRect().height);
    const beforeIndex = queues.indexOf(before);
    const afterIndex = queues.indexOf(after);
    const minimum = Math.min(
      64,
      (heights[beforeIndex] + heights[afterIndex]) / 2
    );
    const change = Math.max(
      minimum - heights[beforeIndex],
      Math.min(delta, heights[afterIndex] - minimum)
    );
    heights[beforeIndex] += change;
    heights[afterIndex] -= change;
    queues.forEach((queue, index) => {
      queue.style.flex = `${heights[index]} 1 0px`;
    });
  }

  @HostListener('pointerdown', ['$event'])
  start(event: PointerEvent): void {
    const pair = this.pair(event.target);
    if (!pair || event.button !== 0) return;
    event.preventDefault();
    this.stopDragging?.();
    const handle = event.target as HTMLElement;
    let previousY = event.clientY;
    const move = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      this.adjust(...pair, moveEvent.clientY - previousY);
      previousY = moveEvent.clientY;
    };
    const stop = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', stop);
      handle.removeEventListener('pointercancel', stop);
      handle.removeEventListener('lostpointercapture', stop);
      this.stopDragging = undefined;
    };
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
    handle.addEventListener('lostpointercapture', stop);
    this.stopDragging = stop;
  }

  @HostListener('keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    const pair = this.pair(event.target);
    if (!pair || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    this.adjust(...pair, event.key === 'ArrowUp' ? -16 : 16);
  }
}
