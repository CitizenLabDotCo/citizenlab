import React from 'react';

import { colors, fontSizes } from '../../utils/styleUtils';
import { render, screen } from '../../utils/testUtils/rtl';

import Text from '.';

describe('<Text />', () => {
  it('renders with default variant (bodyM)', () => {
    const { container } = render(<Text>Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(text).toHaveStyle(`color: ${colors.textPrimary};`);
    expect(text).toHaveStyle(`font-size: ${fontSizes.m}px;`);
    expect(text).toHaveStyle(`font-weight: normal;`);
  });

  it('renders with variant bodyL', () => {
    const { container } = render(<Text variant="bodyL">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`font-size: ${fontSizes.l}px;`);
  });

  it('renders with variant bodyS', () => {
    const { container } = render(<Text variant="bodyS">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`font-size: ${fontSizes.s}px;`);
  });

  it('renders with variant bodyXs', () => {
    const { container } = render(<Text variant="bodyXs">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`font-size: ${fontSizes.xs}px;`);
  });

  it('renders with correct color', () => {
    const { container } = render(<Text color="textSecondary">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`color: ${colors.textSecondary};`);
  });

  it('renders with correct font size', () => {
    const { container } = render(<Text fontSize="xxl">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`font-size: ${fontSizes.xxl}px;`);
  });

  it('renders with correct font weight', () => {
    const { container } = render(<Text fontWeight="bold">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`font-weight:bold;`);
  });

  it('renders with correct text decoration', () => {
    const { container } = render(
      <Text textDecoration="underline">Test text</Text>
    );
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`text-decoration:underline;`);
  });

  it('renders with correct text overflow', () => {
    const { container } = render(
      <Text textOverflow="ellipsis">Test text</Text>
    );
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`text-overflow:ellipsis;`);
  });

  it('renders with correct white space', () => {
    const { container } = render(<Text whiteSpace="nowrap">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`white-space:nowrap;`);
  });

  it('renders with correct text align', () => {
    const { container } = render(<Text textAlign="center">Test title</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`text-align: center;`);
  });

  it('renders with correct tag', () => {
    const { container } = render(<Text as="span">Test text</Text>);
    const text = container.querySelector('span');

    expect(text).toBeInTheDocument();
  });

  it('renders with correct margin', () => {
    const { container } = render(<Text m="0px">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`margin: 0px 0px 0px 0px;`);
    expect(text).toHaveStyle(`margin-top: 0px;`);
    expect(text).toHaveStyle(`margin-bottom: 0px;`);
    expect(text).toHaveStyle(`margin-left: 0px;`);
    expect(text).toHaveStyle(`margin-right: 0px;`);
  });

  it('renders with correct vertical margin', () => {
    const { container } = render(<Text my="1px">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`margin-top: 1px;`);
    expect(text).toHaveStyle(`margin-bottom: 1px;`);
  });

  it('renders with correct bottom margin', () => {
    const { container } = render(<Text mb="2px">Test text</Text>);
    const text = container.querySelector('p');

    expect(text).toHaveStyle(`margin-bottom: 2px;`);
  });
});
