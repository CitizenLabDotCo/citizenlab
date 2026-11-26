import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ActionStatus from '.';

describe('ActionStatus', () => {
  it('announces a running action without a dismiss button', () => {
    render(
      <ActionStatus state="busy" message="Updating 3 ideas…" onDismiss={jest.fn()} />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Updating 3 ideas…');
    expect(
      screen.queryByRole('button', { name: 'Dismiss' })
    ).not.toBeInTheDocument();
  });

  it('can be dismissed once the action is done', async () => {
    const onDismiss = jest.fn();
    render(
      <ActionStatus
        state="done"
        message="3 ideas marked as Accepted"
        onDismiss={onDismiss}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalled();
  });

  it('reports a failure as an alert', () => {
    render(
      <ActionStatus
        state="failed"
        message="Could not update 1 of 3. Please try again."
        onDismiss={jest.fn()}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Could not update 1 of 3.'
    );
  });
});
