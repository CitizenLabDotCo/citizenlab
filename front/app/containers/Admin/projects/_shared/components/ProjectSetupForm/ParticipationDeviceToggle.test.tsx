import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import ParticipationDeviceToggle from './ParticipationDeviceToggle';

// Assigning to the module namespace does not work here, as the transformer
// emits ES module exports as non-configurable getters.
jest.mock('hooks/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFeatureFlag = jest.mocked(useFeatureFlag);

describe('ParticipationDeviceToggle', () => {
  it('renders nothing when the feature flag is off', () => {
    mockFeatureFlag.mockReturnValue(false);
    render(<ParticipationDeviceToggle checked={false} onChange={jest.fn()} />);

    expect(screen.queryByText('Participant device')).not.toBeInTheDocument();
  });

  it('flips track_participation_device when toggled', () => {
    mockFeatureFlag.mockReturnValue(true);
    const onChange = jest.fn();
    render(<ParticipationDeviceToggle checked={false} onChange={onChange} />);

    fireEvent.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith({
      track_participation_device: true,
    });
  });
});
