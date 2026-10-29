import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import ParticipationLocationToggle from './ParticipationLocationToggle';

// Assigning to the module namespace does not work here, as the transformer
// emits ES module exports as non-configurable getters.
jest.mock('hooks/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFeatureFlag = useFeatureFlag as jest.Mock;

describe('ParticipationLocationToggle', () => {
  it('renders nothing when the feature flag is off', () => {
    mockFeatureFlag.mockReturnValue(false);
    render(
      <ParticipationLocationToggle checked={false} onChange={jest.fn()} />
    );

    expect(screen.queryByText('Participant location')).not.toBeInTheDocument();
  });

  it('flips track_participation_location when toggled', () => {
    mockFeatureFlag.mockReturnValue(true);
    const onChange = jest.fn();
    render(<ParticipationLocationToggle checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith({
      track_participation_location: true,
    });
  });
});
