import React from 'react';

import { PREVIEW_PAINTED } from 'utils/previewFrame/painted';
import { act, render, screen } from 'utils/testUtils/rtl';

import PhonePreview from '.';

// The skeleton screen sits over the box that holds the iframe.
const screenSkeleton = () =>
  screen.getByTitle('Preview').parentElement?.parentElement?.nextElementSibling;

const paint = (source: Window | null) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: PREVIEW_PAINTED },
        origin: window.location.origin,
        source,
      })
    );
  });

const frameWindow = () =>
  screen.getByTitle<HTMLIFrameElement>('Preview').contentWindow;

describe('PhonePreview', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('keeps the skeleton screen until the page in the phone has painted', () => {
    const { rerender } = render(
      <PhonePreview src="/en/projects/one" title="Preview" skeleton />
    );
    expect(screenSkeleton()).not.toHaveAttribute('data-hidden');

    // Another window saying it painted changes nothing.
    paint(window);
    expect(screenSkeleton()).not.toHaveAttribute('data-hidden');

    paint(frameWindow());
    expect(screenSkeleton()).toHaveAttribute('data-hidden');

    // Another page shows the skeleton again until it paints.
    rerender(<PhonePreview src="/en/projects/two" title="Preview" skeleton />);
    expect(screenSkeleton()).not.toHaveAttribute('data-hidden');
  });

  it('drops the skeleton screen when the page never reports back', () => {
    render(<PhonePreview src="/en/projects/one" title="Preview" skeleton />);

    act(() => jest.advanceTimersByTime(10000));
    expect(screenSkeleton()).toHaveAttribute('data-hidden');
  });

  it('shows no skeleton screen unless asked', () => {
    render(<PhonePreview src="/en/projects/one" title="Preview" />);
    expect(screenSkeleton()).toBeNull();
  });
});
