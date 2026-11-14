import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollHintDirective } from './scroll-hint.directive';

@Component({
  imports: [ScrollHintDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section appScrollHint>
      <ion-list style="display: block; height: 100px; overflow-y: auto">
        <div style="height: 300px"></div>
      </ion-list>
    </section>
    @if (showServiceJudges()) {
      <section appScrollHint class="service-judges">
        <ion-list style="display: block; height: 100px; overflow-y: auto">
          <div style="height: 300px"></div>
        </ion-list>
      </section>
    }
  `
})
class TestQueueComponent {
  readonly showServiceJudges = signal(false);
}

describe('Queue scroll hint', () => {
  let fixture: ComponentFixture<TestQueueComponent>;
  let section: HTMLElement;
  let list: HTMLElement;

  const waitForHint = async (visible: boolean) => {
    for (let attempt = 0; attempt < 50; attempt++) {
      if (section.classList.contains('has-more-below') === visible) break;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    expect(section.classList.contains('has-more-below')).toBe(visible);
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestQueueComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    section = fixture.nativeElement.querySelector('section');
    list = fixture.nativeElement.querySelector('ion-list');
    await waitForHint(true);
  });

  it('shows the arrow when the service-judge section is enabled later', async () => {
    fixture.componentInstance.showServiceJudges.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    section = fixture.nativeElement.querySelector('.service-judges');
    await waitForHint(true);
  });

  it('hides at the bottom and reappears when scrolled up', async () => {
    list.scrollTop = list.scrollHeight;
    list.dispatchEvent(new Event('scroll'));
    await waitForHint(false);
    list.scrollTop = 0;
    list.dispatchEvent(new Event('scroll'));
    await waitForHint(true);
  });

  it('updates when the available list height changes', async () => {
    list.style.height = '400px';
    await waitForHint(false);
    list.style.height = '100px';
    await waitForHint(true);
  });

  it('updates when list items are removed or added', async () => {
    list.replaceChildren();
    await waitForHint(false);
    const item = document.createElement('div');
    item.style.height = '300px';
    list.append(item);
    await waitForHint(true);
  });
});
