import React from 'react';
import eventEmitter from 'utils/eventEmitter';
import { fireEvent, render, screen } from 'utils/testUtils/rtl';
import CookiePolicy from '../CookiePolicy';

jest.mock('utils/eventEmitter');
jest.mock('hooks/useAppConfiguration', () => () => ({
  attributes: { settings: { core: { organization_name: { en: 'orgName' } } } },
}));
jest.mock('modules', () => ({ streamsToReset: [] }));
jest.mock('components/Fragment', () => ({ children }) => {
  return <div>{children}</div>;
});

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
