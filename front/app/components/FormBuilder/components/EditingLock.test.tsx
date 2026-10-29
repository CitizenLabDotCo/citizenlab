import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import EditingLock from './EditingLock';

describe('EditingLock', () => {
  it('makes its content inert while locked', () => {
    render(
      <EditingLock locked>
        <button type="button">Add question</button>
      </EditingLock>
    );

    expect(screen.getByRole('button').parentElement).toHaveAttribute('inert');
  });

  it('leaves its content usable while unlocked', () => {
    render(
      <EditingLock locked={false}>
        <button type="button">Add question</button>
      </EditingLock>
    );

    expect(screen.getByRole('button').parentElement).not.toHaveAttribute(
      'inert'
    );
  });
});
