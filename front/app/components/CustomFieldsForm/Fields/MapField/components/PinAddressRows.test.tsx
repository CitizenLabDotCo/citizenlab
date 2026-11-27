import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import PinAddressRows from './PinAddressRows';

jest.mock('api/reverse_geocode/useReverseGeocodedAddresses', () =>
  jest.fn((coordinates: number[][]) =>
    coordinates.map(([lng, lat]) => ({
      address: `Address of ${lng},${lat}`,
      isLoading: false,
    }))
  )
);

const PARK_LANE = [4.35, 50.85];
const HARBOUR_ROAD = [4.36, 50.86];

const defaultProps = {
  onAddPin: jest.fn(),
  onReplacePin: jest.fn(),
  onRemovePin: jest.fn(),
};

describe('PinAddressRows', () => {
  beforeEach(() => jest.clearAllMocks());

  it('gives every pin a numbered row and offers one more', () => {
    render(
      <PinAddressRows
        coordinates={[PARK_LANE, HARBOUR_ROAD]}
        {...defaultProps}
      />
    );

    expect(screen.getByText('Address of 4.35,50.85')).toBeInTheDocument();
    expect(screen.getByText('Address of 4.36,50.86')).toBeInTheDocument();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // The empty row is numbered as the pin it would become.
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Enter an address...')).toBeInTheDocument();
  });

  it('stops offering another row once the maximum is reached', () => {
    render(
      <PinAddressRows
        coordinates={[PARK_LANE, HARBOUR_ROAD]}
        maxPins={2}
        {...defaultProps}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
    expect(screen.queryByText('Enter an address...')).not.toBeInTheDocument();
  });

  it('keeps offering another row when there is no maximum', () => {
    render(<PinAddressRows coordinates={[PARK_LANE]} {...defaultProps} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('removes the pin whose own trash button is pressed', async () => {
    render(
      <PinAddressRows
        coordinates={[PARK_LANE, HARBOUR_ROAD]}
        {...defaultProps}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove location 2' })
    );

    expect(defaultProps.onRemovePin).toHaveBeenCalledWith(1);
  });

  it('gives the empty row no trash button', () => {
    render(<PinAddressRows coordinates={[PARK_LANE]} {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Remove location 1' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove location 2' })
    ).not.toBeInTheDocument();
  });
});
