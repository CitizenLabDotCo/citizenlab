import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import PanelField from '.';

describe('<PanelField />', () => {
  it('renders the label above its field', () => {
    render(
      <PanelField label="Phase title">
        <input aria-label="title" />
      </PanelField>
    );
    const label = screen.getByText('Phase title');
    const field = screen.getByLabelText('title');
    expect(
      label.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
