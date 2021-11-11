import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import ScanCategory from './ScanCategory';

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

jest.mock('utils/cl-intl');
jest.mock('services/locale');

const defaultProps = {
  loading: false,
  triggerScan: jest.fn(),
};

describe('Scan category', () => {
  it('renders', () => {
    render(<ScanCategory {...defaultProps} />);
    expect(
      screen.getByTestId('insightsScanCategory-banner')
    ).toBeInTheDocument();
  });

  it('disables button if there are pending tasks ', () => {
    render(<ScanCategory {...defaultProps} loading={true} />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls triggerScan on button click', () => {
    render(<ScanCategory {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    expect(defaultProps.triggerScan).toHaveBeenCalled();
  });

  it('does not render scan category when no nlp feature flag as banner', () => {
    mockFeatureFlagData = false;

    render(<ScanCategory {...defaultProps} />);
    expect(
      screen.queryByTestId('insightsScanCategory-banner')
    ).not.toBeInTheDocument();
  });
});
