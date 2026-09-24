import React from 'react';

import { bo, colors, fontSizes } from '../../utils/styleUtils';
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

  describe('back office styles', () => {
    const geometry = {
      height: '36px',
      padding: '0 16px',
      'border-radius': bo.borderRadius,
    };

    it('renders bo-primary to spec', () => {
      render(<Button buttonStyle="bo-primary">Publish</Button>);

      expect(screen.getByRole('button')).toHaveStyle({
        ...geometry,
        'border-width': '0',
        background: colors.primary,
      });
    });

    it('renders bo-secondary to spec', () => {
      render(<Button buttonStyle="bo-secondary">Share</Button>);

      expect(screen.getByRole('button')).toHaveStyle({
        ...geometry,
        'border-width': '1px',
        'border-color': colors.grey300,
        background: colors.white,
      });
    });

    it('renders bo-status to spec', () => {
      render(<Button buttonStyle="bo-status">Live</Button>);

      expect(screen.getByRole('button')).toHaveStyle({
        ...geometry,
        'border-width': '0',
        background: bo.colors.statusFill,
      });
      expect(screen.getByText('Live')).toHaveStyle({ color: colors.green700 });
    });

    it('labels every back office style at 14px / 500', () => {
      render(<Button buttonStyle="bo-primary">Publish</Button>);

      expect(screen.getByText('Publish')).toHaveStyle({
        'font-size': `${fontSizes.s}px`,
        'font-weight': '500',
      });
    });

    it('lets the call site override the geometry', () => {
      render(<Button buttonStyle="bo-text" padding="0" ariaLabel="Settings" />);

      expect(screen.getByRole('button')).toHaveStyle({ padding: '0' });
    });
  });
});
