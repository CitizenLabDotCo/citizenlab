import React from 'react';

import * as FeatureFlag from 'hooks/useFeatureFlag';

import { render, screen } from 'utils/testUtils/rtl';

import EmptyState from './EmptyState';

const mockFeatureFlag = FeatureFlag as { default: () => boolean };

describe('EmptyState', () => {
  it('renders with an enabled button to create a report when the feature flag is turned on', () => {
    mockFeatureFlag.default = jest.fn(() => true);
    const onOpenModal = jest.fn();
    render(<EmptyState onOpenModal={onOpenModal} />);

    const createReportButton = screen.getByRole('button', {
      name: 'Create a report',
    });
    expect(createReportButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with a disabled button when the feature flag is turned off', () => {
    mockFeatureFlag.default = jest.fn(() => false);
    const onOpenModal = jest.fn();
    render(<EmptyState onOpenModal={onOpenModal} />);

    expect(screen.getByText('Create a report')).toBeInTheDocument();

    const createReportButton = screen.getByRole('button', {
      name: 'Create a report',
    });

    expect(createReportButton).toHaveAttribute('aria-disabled', 'true');
  });
});
