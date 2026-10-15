import React from 'react';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import ToastProvider, { SHOWN_FOR_MS } from './ToastProvider';
import useToast from './useToast';

const Change = () => {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast({ message: 'Order saved', undo: jest.fn() })}
    >
      Change
    </button>
  );
};

const showToast = () => {
  render(
    <ToastProvider>
      <Change />
    </ToastProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Change' }));
};

const waitShownFor = () => act(() => jest.advanceTimersByTime(SHOWN_FOR_MS));

describe('ToastProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('goes away after a few seconds', () => {
    showToast();
    expect(screen.getByText('Order saved')).toBeInTheDocument();

    waitShownFor();
    expect(screen.queryByText('Order saved')).toBeNull();
  });

  it('stays while Undo has the focus, and goes once it leaves', () => {
    showToast();
    const undo = screen.getByRole('button', { name: 'Undo' });

    fireEvent.focus(undo);
    waitShownFor();
    expect(screen.getByText('Order saved')).toBeInTheDocument();

    fireEvent.blur(undo);
    waitShownFor();
    expect(screen.queryByText('Order saved')).toBeNull();
  });

  it('stays while the pointer is on it', () => {
    showToast();

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Undo' }));
    waitShownFor();
    expect(screen.getByText('Order saved')).toBeInTheDocument();
  });
});
