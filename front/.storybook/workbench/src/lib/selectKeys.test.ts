import { firstChildTarget, nestKey } from './selectKeys';

describe('selection keys', () => {
  it('maps Figma keys', () => {
    expect(nestKey({ key: 'Enter', shiftKey: false })).toBe('child');
    expect(nestKey({ key: 'Enter', shiftKey: true })).toBe('parent');
    expect(nestKey({ key: '\\', shiftKey: false })).toBe('parent');
    expect(nestKey({ key: 'Escape', shiftKey: false })).toBe('parent');
    expect(nestKey({ key: 'Enter', shiftKey: false, metaKey: true })).toBe(
      null
    );
    expect(nestKey({ key: 'a', shiftKey: false })).toBe(null);
  });

  it('picks the first child that is part of the story', () => {
    document.body.innerHTML = `
      <div data-gv-story-box>
        <section id="widget">
          <h2 id="title">People</h2>
          <div id="actions">
            <button id="button"><style></style><span id="label">Join</span></button>
          </div>
        </section>
      </div>`;
    const $ = (id: string) => document.getElementById(id) as Element;
    expect(firstChildTarget($('button'))).toBe($('label'));
    expect(firstChildTarget($('label'))).toBeNull();
    expect(firstChildTarget($('widget'), (c) => c.id !== 'title')).toBe(
      $('actions')
    );
  });
});
