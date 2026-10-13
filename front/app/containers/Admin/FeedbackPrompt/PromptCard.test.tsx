import React from 'react';

import { IFeedbackPromptData } from 'api/feedback_prompts/types';

import { fireEvent, render, screen, userEvent } from 'utils/testUtils/rtl';

import PromptCard from './PromptCard';

const mockAnswer = jest.fn();
const mockDismiss = jest.fn();
let mockIsAnswered = false;

jest.mock('api/feedback_prompts/useAnswerFeedbackPrompt', () =>
  jest.fn(() => ({
    mutate: mockAnswer,
    isPending: false,
    isSuccess: mockIsAnswered,
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
    mockIsAnswered = false;
  });

  it('shows the comment box once a score is picked, and sends the answer', async () => {
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);

    expect(
      screen.getByRole('group', { name: /How easy was it to set up/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByText('6'));
    await user.type(screen.getByRole('textbox'), 'Smooth');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenCalledWith({
      id: 'prompt-1',
      score: 6,
      comment: 'Smooth',
    });
  });

  it('changes the score with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);

    await user.click(screen.getByText('3'));
    const thirdRadio = screen.getAllByRole('radio')[2];
    fireEvent.keyDown(thirdRadio, { key: 'ArrowRight' });
    fireEvent.keyDown(thirdRadio, { key: 'ArrowRight' });
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(mockAnswer).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5 })
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

  it('does not dismiss an answered prompt when closed', async () => {
    mockIsAnswered = true;
    const user = userEvent.setup();
    render(<PromptCard prompt={prompt} onClose={jest.fn()} />);

    expect(
      screen.getByText('Thank you for your feedback!')
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Close this question' })
    );

    expect(mockDismiss).not.toHaveBeenCalled();
  });
});
