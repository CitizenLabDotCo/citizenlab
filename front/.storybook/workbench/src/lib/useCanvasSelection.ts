import { useCallback, useEffect, useRef, useState } from 'react';

import {
  atPath,
  defaultTarget,
  labelOf,
  parentTarget,
  pathOf,
} from './inspect';
import { componentOf, firstChildTarget, instanceOf, nestKey } from './nesting';
import { channelOf, whenRendered } from './preview';

// Select: a click on the canvas picks the element under the pointer (the
// story does not see it). Interact: the story gets every click, as before.
export type Tool = 'select' | 'interact';

const OVERLAY = 'data-wb-overlay';
// Figma's selection blue; the frame shows the product, so the outline must
// not borrow a product colour.
const BLUE = '#0d99ff';
// Figma's purple for a component instance, the light --wb-component of
// shell.css (the frame does not have the shell's variables); white on it
// is 5.7:1.
const PURPLE = '#8638e5';

type Kind = 'hover' | 'selected' | 'instance';

const overlay = (doc: Document, kind: Kind) => {
  let el = doc.querySelector<HTMLElement>(`[${OVERLAY}="${kind}"]`);
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute(OVERLAY, kind);
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:2147483647',
      'box-sizing:border-box',
      `border:${kind === 'selected' ? 2 : 1}px solid ${
        kind === 'instance' ? PURPLE : BLUE
      }`,
      'display:none',
    ].join(';');
    if (kind === 'instance') {
      // The component's name over its top left corner.
      const tag = doc.createElement('span');
      tag.style.cssText = [
        'position:absolute',
        'left:-1px',
        'bottom:calc(100% + 2px)',
        `background:${PURPLE}`,
        'color:#fff',
        'font:500 10px/14px system-ui,sans-serif',
        'padding:0 4px',
        'border-radius:2px',
        'white-space:nowrap',
      ].join(';');
      el.appendChild(tag);
    }
    if (kind === 'selected') {
      const tag = doc.createElement('span');
      tag.style.cssText = [
        'position:absolute',
        'left:50%',
        'top:calc(100% + 4px)',
        'transform:translateX(-50%)',
        `background:${BLUE}`,
        'color:#fff',
        'font:500 10px/14px system-ui,sans-serif',
        'padding:0 4px',
        'border-radius:2px',
        'white-space:nowrap',
      ].join(';');
      el.appendChild(tag);
    }
    doc.body.appendChild(el);
  }
  return el;
};

const place = (
  box: HTMLElement,
  target: Element | null,
  name?: string | null
) => {
  if (!target || !target.isConnected) {
    box.style.display = 'none';
    return;
  }
  const r = target.getBoundingClientRect();
  box.style.display = 'block';
  box.style.left = `${r.left}px`;
  box.style.top = `${r.top}px`;
  box.style.width = `${r.width}px`;
  box.style.height = `${r.height}px`;
  const tag = box.firstElementChild as HTMLElement | null;
  if (!tag) return;
  const text = name ?? `${Math.round(r.width)} × ${Math.round(r.height)}`;
  if (tag.textContent !== text) tag.textContent = text;
};

const inStory = (el: Element | null): el is Element =>
  !!el &&
  !el.hasAttribute(OVERLAY) &&
  !!el.closest('[data-gv-story-box]') &&
  !el.matches('[data-gv-story-box]');

// The element picked on the first canvas frame. A new story (switched in
// the same frame or loaded in a new one) starts from its default target; a
// re-render, a remount for another city, mode or language, or a reload
// (`loads`) finds the same element again by its place in the story.
// `version` changes on every pick and render, so readers know to read again.
// `restore` gives the place to select when a story comes in (a return from
// an opened component), read then: the route and the hash state may reach
// the page in two renders. `onOpen` gets the instance a double click lands
// on.
export const useCanvasSelection = (
  frame: Window | null,
  loads: number,
  tool: Tool,
  storyId: string,
  restore: () => number[] | null = () => null,
  onOpen?: (instance: Element) => void
) => {
  const [selected, setSelected] = useState<Element | null>(null);
  const [version, setVersion] = useState(0);
  const path = useRef<number[] | null>(null);

  const pick = useCallback((el: Element | null) => {
    path.current = el ? pathOf(el) : null;
    setSelected(el);
    setVersion((v) => v + 1);
  }, []);

  const latest = useRef({ restore, onOpen });
  latest.current = { restore, onOpen };

  useEffect(() => {
    path.current = latest.current.restore();
  }, [storyId]);

  // Find the selection again after every render of the story.
  useEffect(() => {
    setSelected(null);
    if (!frame) return undefined;
    const find = () => {
      try {
        const doc = frame.document;
        const again = path.current ? atPath(doc, path.current) : null;
        const el = again ?? defaultTarget(doc);
        if (!again) path.current = el ? pathOf(el) : null;
        setSelected(el);
        setVersion((v) => v + 1);
      } catch {
        // The frame navigated away; its successor reads again.
      }
    };
    // The frame stays across a story switch: only the story asked for
    // counts, not the one still shown until it renders.
    const cancel = whenRendered(frame, find, storyId);
    const channel = channelOf(frame);
    const rendered = (id: unknown) => {
      if (id === storyId) find();
    };
    channel?.on('storyRendered', rendered);
    return () => {
      cancel();
      channel?.off('storyRendered', rendered);
    };
  }, [frame, loads, storyId]);

  // Outlines and pointer handling in the frame.
  useEffect(() => {
    if (!frame) return undefined;
    let doc: Document;
    try {
      doc = frame.document;
    } catch {
      return undefined;
    }
    const instance = overlay(doc, 'instance');
    const hover = overlay(doc, 'hover');
    const chosen = overlay(doc, 'selected');
    let hovered: Element | null = null;
    let raf = 0;
    const tick = () => {
      place(chosen, selected);
      // The library component around the pointer, like Figma's instance
      // hover; not the selected one, which the panel names already. The
      // element box stays, unless it is the instance's own outline.
      const inst = tool === 'select' ? instanceOf(hovered) : null;
      place(
        instance,
        inst && inst !== selected ? inst : null,
        inst ? componentOf(inst) : null
      );
      place(
        hover,
        tool === 'select' && hovered !== selected && hovered !== inst
          ? hovered
          : null
      );
      raf = frame.requestAnimationFrame(tick);
    };
    raf = frame.requestAnimationFrame(tick);
    if (tool !== 'select') {
      return () => {
        frame.cancelAnimationFrame(raf);
        instance.remove();
        hover.remove();
        chosen.remove();
      };
    }
    // A transparent cover over the story takes the pointer, so the story
    // never sees it: no hover style in what the panel reads, no press, no
    // menu. The element under the cover is found by position.
    const cover = doc.createElement('div');
    cover.setAttribute(OVERLAY, 'cover');
    cover.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;cursor:default;background:transparent';
    doc.body.appendChild(cover);
    const under = (e: MouseEvent): Element | null =>
      doc
        .elementsFromPoint(e.clientX, e.clientY)
        .find((el): el is Element => inStory(el)) ?? null;
    const onMove = (e: PointerEvent) => {
      hovered = under(e);
    };
    const onLeave = () => {
      hovered = null;
    };
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      const t = under(e);
      if (t) pick(t);
    };
    // A press on the cover keeps the focus in the shell: focus inside the
    // frame is restored by React later through Storybook's patched focus,
    // which throws for a frame that is gone and drops the update.
    // The shell's own focus leaves the control it was on, so Enter is the
    // canvas's and does not press that control again.
    const keepFocus = (e: Event) => {
      e.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) active.blur();
    };
    // A double click opens the component under it (its first click already
    // selected what it hit).
    const onDouble = (e: MouseEvent) => {
      e.preventDefault();
      const inst = instanceOf(under(e));
      if (inst) latest.current.onOpen?.(inst);
    };
    // Figma's keys: Esc, Shift+Enter and \ select the parent, Enter the
    // first child; not while a field of the shell is typed in, nor Enter on
    // a control of the shell.
    const onKey = (e: KeyboardEvent) => {
      const move = nestKey(e);
      if (!move || !selected) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest?.('input, select, textarea, [contenteditable]')) return;
      if (
        e.key !== 'Escape' &&
        t?.closest?.('button, a[href], summary, [role="button"], [role="tab"]')
      ) {
        return;
      }
      const next =
        move === 'parent'
          ? parentTarget(selected)
          : firstChildTarget(selected, (c) => {
              const r = c.getBoundingClientRect();
              return r.width > 0 || r.height > 0;
            });
      if (!next) return;
      e.preventDefault();
      pick(next);
    };
    cover.addEventListener('pointermove', onMove);
    cover.addEventListener('pointerleave', onLeave);
    cover.addEventListener('mousedown', keepFocus);
    cover.addEventListener('click', onClick);
    cover.addEventListener('dblclick', onDouble);
    window.addEventListener('keydown', onKey);
    return () => {
      frame.cancelAnimationFrame(raf);
      cover.remove();
      window.removeEventListener('keydown', onKey);
      hover.style.display = 'none';
      instance.style.display = 'none';
    };
  }, [frame, loads, tool, selected, pick]);

  return {
    selected,
    version,
    pick,
    label: selected ? labelOf(selected) : undefined,
  };
};
