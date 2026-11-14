import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueueResizeDirective } from './queue-resize.directive';

@Component({
  imports: [QueueResizeDirective],
  styles: `
    aside {
      display: flex;
      flex-direction: column;
      height: 600px;
    }
    .official-queue {
      flex: 1 1 0;
      min-height: 64px;
    }
    button {
      flex: 0 0 16px;
      padding: 0;
      border: 0;
    }
  `,
  template: `
    <aside appQueueResize>
      <section class="official-queue"></section>
      @if (withServiceJudge()) {
        <button class="queue-resizer" type="button">Resize</button>
        <section class="official-queue"></section>
      }
      <button class="queue-resizer" type="button">Resize</button>
      <section class="official-queue"></section>
    </aside>
  `
})
class TestQueuesComponent {
  readonly withServiceJudge = signal(false);
}

describe('Resizable queues', () => {
  let fixture: ComponentFixture<TestQueuesComponent>;
  const queues = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.official-queue'));
  const handle = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('button');
  const heights = () =>
    queues().map((queue) => queue.getBoundingClientRect().height);
  const key = (name: string) =>
    handle().dispatchEvent(
      new KeyboardEvent('keydown', { key: name, bubbles: true })
    );

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestQueuesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('starts at halves or thirds and resets after changing SJ mode', async () => {
    expect(heights()).toEqual([292, 292]);
    key('ArrowDown');
    fixture.componentInstance.withServiceJudge.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (const height of heights()) expect(height).toBeCloseTo(568 / 3, 1);
  });

  it('resizes adjacent queues with the keyboard and keeps the total height', () => {
    key('ArrowDown');
    expect(heights()).toEqual([308, 276]);
    key('ArrowUp');
    expect(heights()).toEqual([292, 292]);
  });

  it('drags the divider and enforces a minimum height', () => {
    const divider = handle();
    spyOn(divider, 'setPointerCapture');
    divider.dispatchEvent(
      new PointerEvent('pointerdown', {
        pointerId: 1,
        clientY: 100,
        button: 0,
        bubbles: true
      })
    );
    divider.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientY: 170 })
    );
    expect(heights()).toEqual([362, 222]);
    divider.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientY: 10000 })
    );
    expect(heights()).toEqual([520, 64]);
    divider.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    divider.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientY: 100 })
    );
    expect(heights()).toEqual([520, 64]);
  });

  it('preserves resized proportions when the sidebar changes height', () => {
    key('ArrowDown');
    const aside: HTMLElement = fixture.nativeElement.querySelector('aside');
    aside.style.height = '1184px';
    expect(heights()).toEqual([616, 552]);
  });
});
