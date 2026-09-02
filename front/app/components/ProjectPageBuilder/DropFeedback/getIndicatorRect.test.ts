import { Placement } from '@craftjs/core';

import getIndicatorRect, { INDICATOR_THICKNESS } from './getIndicatorRect';

const buildElement = (
  rect: { top: number; left: number; width: number; height: number },
  parentStyle: Partial<CSSStyleDeclaration> = {},
  ownStyle: Partial<CSSStyleDeclaration> = {}
) => {
  const parent = document.createElement('div');
  const element = document.createElement('div');
  parent.appendChild(element);

  element.getBoundingClientRect = () =>
    ({
      ...rect,
      bottom: rect.top + rect.height,
      right: rect.left + rect.width,
    } as DOMRect);

  jest.spyOn(window, 'getComputedStyle').mockImplementation(
    (target) =>
      ({
        display: 'block',
        flexDirection: 'column',
        paddingTop: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        ...(target === parent ? parentStyle : ownStyle),
      } as CSSStyleDeclaration)
  );

  return element;
};

const placement = (dom: HTMLElement | null, where: 'before' | 'after') =>
  ({
    parent: { dom },
    index: 0,
    where,
    currentNode: dom ? { dom } : null,
  } as unknown as Placement);

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getIndicatorRect', () => {
  it('straddles the top edge of the target when dropping before it', () => {
    const dom = buildElement({ top: 100, left: 20, width: 500, height: 80 });

    expect(getIndicatorRect(placement(dom, 'before'))).toEqual({
      top: 100 - INDICATOR_THICKNESS / 2,
      left: 20,
      width: 500,
      height: INDICATOR_THICKNESS,
      vertical: false,
    });
  });

  it('straddles the bottom edge of the target when dropping after it', () => {
    const dom = buildElement({ top: 100, left: 20, width: 500, height: 80 });

    expect(getIndicatorRect(placement(dom, 'after'))).toEqual({
      top: 180 - INDICATOR_THICKNESS / 2,
      left: 20,
      width: 500,
      height: INDICATOR_THICKNESS,
      vertical: false,
    });
  });

  it('turns vertical when the target sits in a row', () => {
    const dom = buildElement(
      { top: 100, left: 20, width: 500, height: 80 },
      { display: 'flex', flexDirection: 'row' }
    );

    expect(getIndicatorRect(placement(dom, 'after'))).toEqual({
      top: 100,
      left: 520 - INDICATOR_THICKNESS / 2,
      width: INDICATOR_THICKNESS,
      height: 80,
      vertical: true,
    });
  });

  it('falls back to the top of the content box of an empty canvas', () => {
    const dom = buildElement({ top: 100, left: 20, width: 500, height: 80 });
    jest.spyOn(window, 'getComputedStyle').mockImplementation(
      () =>
        ({
          display: 'block',
          flexDirection: 'column',
          paddingTop: '10px',
          paddingLeft: '8px',
          paddingRight: '8px',
        } as CSSStyleDeclaration)
    );

    expect(
      getIndicatorRect({
        ...placement(dom, 'before'),
        currentNode: null,
      })
    ).toEqual({
      top: 110,
      left: 28,
      width: 484,
      height: INDICATOR_THICKNESS,
      vertical: false,
    });
  });

  it('renders nothing when the parent has no DOM node yet', () => {
    expect(getIndicatorRect(placement(null, 'before'))).toBeNull();
  });
});
