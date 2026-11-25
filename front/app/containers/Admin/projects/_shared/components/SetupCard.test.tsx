import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import SetupCard from './SetupCard';

const mockOnReview = jest.fn();

jest.mock('./SetupReview', () => ({
  useSetupReview: () => ({
    enabled: true,
    reviewed: false,
    isError: false,
    onReview: mockOnReview,
  }),
}));

describe('SetupCard', () => {
  beforeEach(() => {
    mockOnReview.mockClear();
  });

  it('counts a click inside the card as a review', async () => {
    render(<SetupCard title="Voting method" reviewKey="voting_method" />);

    await userEvent.click(screen.getByText('Voting method'));

    expect(mockOnReview).toHaveBeenCalledTimes(1);
  });

  it('does not count a click as a review while the card still needs a choice', async () => {
    render(
      <SetupCard
        title="Voting method"
        reviewKey="voting_method"
        reviewNeedsChoice
      />
    );

    await userEvent.click(screen.getByText('Voting method'));

    expect(mockOnReview).not.toHaveBeenCalled();
    expect(screen.getByText('To set')).toBeInTheDocument();
  });

  it('keeps the tooltip when an action card has a body', async () => {
    render(
      <SetupCard
        title="Voting method"
        titleTooltip={<span>Choose how people vote.</span>}
        button={{ icon: 'edit', onClick: jest.fn(), actionLabel: 'Edit' }}
      >
        <p>A voting method is already set.</p>
      </SetupCard>
    );

    await userEvent.tab();

    expect(screen.getByText('Voting method')).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Choose how people vote.'
    );
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('A voting method is already set.')).toBeVisible();
  });
});
