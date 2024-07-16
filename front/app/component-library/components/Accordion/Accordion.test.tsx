import React from 'react';

import { fireEvent, render, screen } from '../../utils/testUtils/rtl';

import Accordion from '.';

describe('<Accordion />', () => {
  it('renders content when opened by default', () => {
    render(
      <Accordion isOpenByDefault={true} title="Section title">
        Section content
      </Accordion>
    );
    expect(screen.queryByText('Section content')).toBeInTheDocument();
  });

  it('does not render content when closed by default', () => {
    render(
      <Accordion isOpenByDefault={false} title="Section title">
        Section content
      </Accordion>
    );
    expect(screen.queryByText('Section content')).not.toBeInTheDocument();
  });

  it('renders content when clicked open', () => {
    render(
      <Accordion isOpenByDefault={false} title="Section title">
        Section content
      </Accordion>
    );
    expect(screen.queryByText('Section content')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Section content')).toBeInTheDocument();
  });

  it('does not render content when clicked closed', () => {
    render(
      <Accordion isOpenByDefault={true} title="Section title">
        Section content
      </Accordion>
    );
    expect(screen.queryByText('Section content')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Section content')).not.toBeInTheDocument();
  });
});
