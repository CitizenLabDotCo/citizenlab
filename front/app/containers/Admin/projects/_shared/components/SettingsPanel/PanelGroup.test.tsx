import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ExpandAllContext from './ExpandAllContext';
import PanelGroup from './PanelGroup';
import PanelHeading from './PanelHeading';
import useExpandAll from './useExpandAll';

jest.mock('../SetupReview', () => ({
  useSetupReview: () => ({ enabled: false, reviewed: false }),
}));

const Settings = () => {
  const expandAll = useExpandAll();

  return (
    <ExpandAllContext.Provider value={expandAll}>
      <PanelHeading label="Settings" expandable />
      <PanelGroup label="Participant actions" summary="Submit +2">
        <p>Submitting inputs</p>
      </PanelGroup>
      <PanelGroup label="Moderation">
        <p>Assignee</p>
      </PanelGroup>
    </ExpandAllContext.Provider>
  );
};

describe('PanelGroup', () => {
  it('starts closed and shows its summary', () => {
    render(<Settings />);

    expect(screen.getByText('Submit +2')).toBeInTheDocument();
    expect(screen.getByText('Submitting inputs')).not.toBeVisible();
  });

  it('opens while a field inside shows an error', () => {
    render(
      <PanelGroup label="Proposal requirements" hasError>
        <p>Votes needed</p>
      </PanelGroup>
    );

    expect(screen.getByText('Votes needed')).toBeVisible();
  });

  it('opens every card when Expand all is pressed', async () => {
    render(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Expand all' }));

    expect(screen.getByText('Submitting inputs')).toBeVisible();
    expect(screen.getByText('Assignee')).toBeVisible();
  });

  it('closes every card again when Collapse all is pressed', async () => {
    render(<Settings />);

    await userEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    await userEvent.click(screen.getByRole('button', { name: 'Collapse all' }));

    expect(screen.getByText('Submitting inputs')).not.toBeVisible();
    expect(screen.getByText('Assignee')).not.toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Expand all' })
    ).toBeInTheDocument();
  });

  it('offers no Expand all without a provider', () => {
    render(<PanelHeading label="Settings" expandable />);

    expect(
      screen.queryByRole('button', { name: 'Expand all' })
    ).not.toBeInTheDocument();
  });
});
