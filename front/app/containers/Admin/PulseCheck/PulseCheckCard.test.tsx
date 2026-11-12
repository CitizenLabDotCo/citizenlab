import React from 'react';

import { IPulseCheckData } from 'api/pulse_checks/types';

import { act, fireEvent, render, screen, userEvent } from 'utils/testUtils/rtl';

import PulseCheckCard from './PulseCheckCard';

const mockAnswer = jest.fn();
const mockDismiss = jest.fn();
let mockIsError = false;

jest.mock('api/pulse_checks/useAnswerPulseCheck', () =>
  jest.fn(() => ({
    mutateAsync: mockAnswer,
    isPending: false,
    isError: mockIsError,
  }))
);

jest.mock('api/pulse_checks/useDismissPulseCheck', () =>
  jest.fn(() => ({ mutate: mockDismiss }))
);

const pulseCheck: IPulseCheckData = {
  id: 'pulse-check-1',
  type: 'pulse_check',
  attributes: { key: 'project_setup_ease', status: 'shown' },
};

describe('PulseCheckCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsError = false;
    mockAnswer.mockResolvedValue({ data: pulseCheck });
  });

  it('shows the comment box once a score is picked, and sends the answer', async () => {
    const user = userEvent.setup();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={jest.fn()} />);

    expect(
      screen.getByRole('group', { name: /How easy was it to set up/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '6' }));
    expect(mockAnswer).toHaveBeenCalledWith({ id: 'pulse-check-1', score: 6 });
    expect(
      screen.queryByText('Thank you for your feedback!')
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'Smooth');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenLastCalledWith({
      id: 'pulse-check-1',
      score: 6,
      comment: 'Smooth',
    });
    expect(
      screen.getByText('Thank you for your feedback!')
    ).toBeInTheDocument();
  });

  it('changes the score with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={jest.fn()} />);

    await user.click(screen.getByText('3'));
    const thirdButton = screen.getByRole('button', { name: '3' });
    await act(async () => {
      fireEvent.keyDown(thirdButton, { key: 'ArrowRight' });
    });
    expect(screen.getByRole('button', { name: '4' })).toHaveFocus();
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('button', { name: '4' }), {
        key: 'ArrowRight',
      });
    });
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5 })
    );
  });

  it('moves from the focused score when none has been selected', () => {
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={jest.fn()} />);
    const thirdButton = screen.getByRole('button', { name: '3' });
    thirdButton.focus();
    fireEvent.keyDown(thirdButton, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '4' })).toHaveFocus();
    expect(mockAnswer).toHaveBeenCalledWith({ id: 'pulse-check-1', score: 4 });
  });

  it('dismisses the pulse check when closed before answering', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={onClose} />);

    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );

    expect(mockDismiss).toHaveBeenCalledWith('pulse-check-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps a saved score when closed without sending a comment', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a save error and allows retrying with Send', async () => {
    mockIsError = true;
    mockAnswer.mockRejectedValueOnce(new Error('Save failed'));
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={onClose} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your feedback could not be saved. Please try again.'
    );
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(
      screen.getByText('Thank you for your feedback!')
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('dismisses after closing if the in-flight save fails', async () => {
    let rejectSave: (error: Error) => void = () => {};
    mockAnswer.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectSave = reject;
        })
    );
    const user = userEvent.setup();
    const { unmount } = render(
      <PulseCheckCard pulseCheck={pulseCheck} onClose={jest.fn()} />
    );
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );
    expect(mockDismiss).not.toHaveBeenCalled();
    unmount();
    await act(async () => {
      rejectSave(new Error('Save failed'));
    });
    expect(mockDismiss).toHaveBeenCalledWith('pulse-check-1');
  });

  it('keeps focus on the selected score during a pending save', async () => {
    mockAnswer.mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<PulseCheckCard pulseCheck={pulseCheck} onClose={jest.fn()} />);
    screen.getByRole('button', { name: '3' }).focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('button', { name: '4' })).toHaveFocus();
    expect(mockAnswer).toHaveBeenCalledTimes(1);
    expect(mockAnswer).toHaveBeenCalledWith({ id: 'pulse-check-1', score: 4 });
  });
});
