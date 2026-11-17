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
});
