import React from 'react';

import eventEmitter from 'utils/eventEmitter';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import CookiePolicy from '../CookiePolicy';

jest.mock('utils/eventEmitter');

// We need to mock useCustomPageBySlug but this is only used
// when we use a custom cookie policy page. For most platforms,
// This will return undefined. Hence, we mock it to return undefined.
jest.mock('api/custom_pages/useCustomPageBySlug', () =>
  jest.fn(() => ({ data: undefined }))
);

describe('CookiePolicy', () => {
  it('renders correctly', () => {
    render(<CookiePolicy />);
    expect(screen.getByTestId('cookiePolicy')).toBeInTheDocument();
  });
  it('calls event emitter correctly on view preferences', () => {
    render(<CookiePolicy />);
    const button = screen.getByTestId('viewPreferencesButton');
    fireEvent.click(button);
    expect(eventEmitter.emit).toHaveBeenCalledWith('openConsentManager');
  });
  it('calls event emitter correctly on manage preferences', () => {
    render(<CookiePolicy />);
    const button = screen.getByTestId('managePreferencesButton');
    fireEvent.click(button);
    expect(eventEmitter.emit).toHaveBeenCalledWith('openConsentManager');
  });
});
