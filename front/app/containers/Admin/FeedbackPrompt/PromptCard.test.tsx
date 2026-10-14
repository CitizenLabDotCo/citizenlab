import React from 'react';

import { IFeedbackPromptData } from 'api/feedback_prompts/types';

import { fireEvent, render, screen, userEvent } from 'utils/testUtils/rtl';

import PromptCard from './PromptCard';

const mockAnswer = jest.fn();
const mockDismiss = jest.fn();
let mockIsSending = false;
let mockIsError = false;

jest.mock('api/feedback_prompts/useAnswerFeedbackPrompt', () =>
  jest.fn(() => ({
    mutate: mockAnswer,
    isPending: mockIsSending,
    isError: mockIsError,
  }))
);

jest.mock('api/feedback_prompts/useDismissFeedbackPrompt', () =>
  jest.fn(() => ({ mutate: mockDismiss }))
);

const prompt: IFeedbackPromptData = {
  id: 'prompt-1',
  type: 'feedback_prompt',
  attributes: { key: 'project_setup_ease', status: 'shown' },
};

describe('PromptCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSending = false;
    mockIsError = false;
    mockAnswer.mockImplementation((_answer, options) => options?.onSuccess?.());
  });

  it('shows the comment box once a score is picked, and sends the answer', async () => {
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);

    expect(
      screen.getByRole('group', { name: /How easy was it to set up/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '6' }));
    expect(mockAnswer).toHaveBeenCalledWith(
      { id: 'prompt-1', score: 6 },
      expect.any(Object)
    );
    expect(
      screen.queryByText('Thank you for your feedback!')
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'Smooth');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenLastCalledWith(
      { id: 'prompt-1', score: 6, comment: 'Smooth' },
      expect.any(Object)
    );
    expect(
      screen.getByText('Thank you for your feedback!')
    ).toBeInTheDocument();
  });

  it('changes the score with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);

    await user.click(screen.getByText('3'));
    const thirdButton = screen.getByRole('button', { name: '3' });
    fireEvent.keyDown(thirdButton, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '4' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('button', { name: '4' }), {
      key: 'ArrowRight',
    });
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5 }),
      expect.any(Object)
    );
  });

  it('moves from the focused score when none has been selected', () => {
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);
    const thirdButton = screen.getByRole('button', { name: '3' });
    thirdButton.focus();
    fireEvent.keyDown(thirdButton, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: '4' })).toHaveFocus();
    expect(mockAnswer).toHaveBeenCalledWith(
      { id: 'prompt-1', score: 4 },
      expect.any(Object)
    );
  });

  it('dismisses the prompt when closed before answering', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PromptCard prompt={prompt} onClose={onClose} />);

    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );

    expect(mockDismiss).toHaveBeenCalledWith('prompt-1');
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps a saved score when closed without sending a comment', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PromptCard prompt={prompt} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: '6' }));
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );
    expect(mockDismiss).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a save error and allows retrying with Send', async () => {
    mockIsError = true;
    mockAnswer.mockImplementationOnce(() => {});
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<PromptCard prompt={prompt} onClose={onClose} />);
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

  it('does not dismiss while a score is being saved', async () => {
    mockIsSending = true;
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );
    expect(mockDismiss).not.toHaveBeenCalled();
  });
});
