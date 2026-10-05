import { renderHook, act } from 'utils/testUtils/rtl';

import useIsDragging from './useIsDragging';

const dragFrom = (element: HTMLElement, type: 'dragstart' | 'dragend') => {
  act(() => {
    element.dispatchEvent(new Event(type, { bubbles: true }));
  });
};

const appendElement = (draggable: boolean) => {
  const element = document.createElement('div');
  if (draggable) element.setAttribute('draggable', 'true');
  document.body.appendChild(element);
  return element;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useIsDragging', () => {
  it('follows a drag started on a draggable element', () => {
    const element = appendElement(true);
    const { result } = renderHook(useIsDragging);

    expect(result.current).toBe(false);

    dragFrom(element, 'dragstart');
    expect(result.current).toBe(true);

    dragFrom(element, 'dragend');
    expect(result.current).toBe(false);
  });

  it('ignores drags that do not start on a draggable element', () => {
    const element = appendElement(false);
    const { result } = renderHook(useIsDragging);

    dragFrom(element, 'dragstart');
    expect(result.current).toBe(false);
  });
});
