import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import Button from '.';

describe('<Button />', () => {
  it('renders', () => {
    render(<Button>Test button</Button>);
    expect(screen.getByText('Test button')).toBeInTheDocument();
  });

  it('is clickable', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Test button</Button>);

    const button = screen.getByText('Test button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary-inverse button', () => {
    render(
      <Button
        buttonStyle="primary-inverse"
        fontWeight="500"
        padding="13px 22px"
      >
        Test button
      </Button>
    );
    expect(screen.getByText('Test button')).toBeInTheDocument();
  });

  it('renders an anchor tag and HREF properly with the "as" property', () => {
    const { getByRole } = render(
      <Button
        buttonStyle="primary-inverse"
        fontWeight="500"
        padding="13px 22px"
        as={() => {
          return <a href="www.test.com">Link Content</a>;
        }}
      >
        Test button as anchor
      </Button>
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', 'www.test.com');
  });

  it('does not allow click events when disabled is true', () => {
    const handleClick = jest.fn();

    render(
      <Button disabled onClick={handleClick}>
        Test button
      </Button>
    );

    const button = screen.getByText('Test button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(0);
  });
});
