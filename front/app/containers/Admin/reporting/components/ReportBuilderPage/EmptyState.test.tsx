import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { render, screen } from 'utils/testUtils/rtl';

import EmptyState from './EmptyState';

// Assigning to the module namespace does not work here, as the transformer
// emits ES module exports as non-configurable getters.
jest.mock('hooks/useFeatureFlag', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockFeatureFlag = useFeatureFlag as jest.Mock;

describe('EmptyState', () => {
  it('renders with an enabled button to create a report when the feature flag is turned on', () => {
    mockFeatureFlag.mockReturnValue(true);
    const onOpenModal = jest.fn();
    render(<EmptyState onOpenModal={onOpenModal} />);

    const createReportButton = screen.getByRole('button', {
      name: 'Create a report',
    });
    expect(createReportButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('renders with a disabled button when the feature flag is turned off', () => {
    mockFeatureFlag.mockReturnValue(false);
    const onOpenModal = jest.fn();
    render(<EmptyState onOpenModal={onOpenModal} />);

    expect(screen.getByText('Create a report')).toBeInTheDocument();

    const createReportButton = screen.getByRole('button', {
      name: 'Create a report',
    });

    expect(createReportButton).toHaveAttribute('aria-disabled', 'true');
  });
});
