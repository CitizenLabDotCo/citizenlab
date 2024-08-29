import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';
import Accordion from '../Accordion';

import ListItem from '.';

describe('<ListItem />', () => {
  it('renders item with top border', () => {
    render(<ListItem>Some text.</ListItem>);
    expect(screen.queryByText('Some text.')).toHaveStyle(
      'border-top: 1px solid #E0E0E0;'
    );
  });

  it('renders item without top border', () => {
    render(
      <>
        <Accordion title="Section title">Section content</Accordion>
        <ListItem>Some text.</ListItem>
      </>
    );
    expect(screen.queryByText('Some text.')).toHaveStyle('border-top: none;');
  });
});
