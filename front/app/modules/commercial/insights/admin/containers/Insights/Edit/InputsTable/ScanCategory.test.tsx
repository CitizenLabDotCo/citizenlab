import React from 'react';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import ScanCategory from './ScanCategory';
import { ScanStatus } from 'modules/commercial/insights/hooks/useScanInsightsCategory';

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

jest.mock('utils/cl-intl');
jest.mock('services/locale');

const defaultProps = {
  status: 'isIdle' as ScanStatus,
  progress: 0,
  triggerScan: jest.fn(),
  cancelScan: jest.fn(),
  onClose: jest.fn(),
};

describe('Scan category', () => {
  it('renders', () => {
    render(<ScanCategory {...defaultProps} />);
    expect(
      screen.getByTestId('insightsScanCategory-banner')
    ).toBeInTheDocument();
  });

  it('shows progress with correct width when scanning', () => {
    render(
      <ScanCategory {...defaultProps} status="isScanning" progress={0.5} />
    );
    expect(screen.getByTestId('insightsScanCategory-progress')).toHaveStyle(
      'width: 50%'
    );
  });

  it('calls triggerScan on button click when idle', () => {
    render(<ScanCategory {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));

    expect(defaultProps.triggerScan).toHaveBeenCalled();
  });

  it('calls onClose on button click when done', () => {
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
