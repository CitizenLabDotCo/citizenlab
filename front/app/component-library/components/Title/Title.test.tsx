import React from 'react';

import { colors, fontSizes } from '../../utils/styleUtils';
import { render, screen } from '../../utils/testUtils/rtl';

import Title from '.';

describe('<Title />', () => {
  it('renders with default variant (h1)', () => {
    render(<Title id="test-title">Test title</Title>);
    const text = screen.getByRole('heading', { level: 1 });

    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(text).toHaveStyle(`color: ${colors.textPrimary};`);
    expect(text).toHaveStyle(`font-size: ${fontSizes.xxxl}px;`);
    expect(text).toHaveStyle(`font-weight: bold;`);
    expect(text).toHaveAttribute('id');
  });

  it('renders with variant h2', () => {
    render(<Title variant="h2">Test title</Title>);
    const text = screen.getByRole('heading', { level: 2 });

    expect(text).toHaveStyle(`font-size: ${fontSizes.xxl}px;`);
  });

  it('renders with variant h3', () => {
    render(<Title variant="h3">Test title</Title>);
    const text = screen.getByRole('heading', { level: 3 });

    expect(text).toHaveStyle(`font-size: ${fontSizes.xl}px;`);
  });

  it('renders with variant h4', () => {
    render(<Title variant="h4">Test title</Title>);
    const text = screen.getByRole('heading', { level: 4 });

    expect(text).toHaveStyle(`font-size: ${fontSizes.l}px;`);
  });

  it('renders with variant h5', () => {
    render(<Title variant="h5">Test title</Title>);
    const text = screen.getByRole('heading', { level: 5 });

    expect(text).toHaveStyle(`font-size: ${fontSizes.m}px;`);
  });

  it('renders with variant h6', () => {
    render(<Title variant="h6">Test title</Title>);
    const text = screen.getByRole('heading', { level: 6 });

    expect(text).toHaveStyle(`font-size: ${fontSizes.s}px;`);
  });

  it('renders with correct color', () => {
    render(<Title color="textPrimary">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`color: ${colors.textPrimary};`);
  });

  it('renders with correct font size', () => {
    render(<Title fontSize="s">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`font-size: ${fontSizes.s}px;`);
  });

  it('renders with correct text align', () => {
    render(<Title textAlign="center">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`text-align: center;`);
  });

  it('renders with correct tag', () => {
    render(<Title as="h6">Test title</Title>);
    const text = screen.getByRole('heading', { level: 6 });

    expect(text).toBeInTheDocument();
  });

  it('renders with correct margin', () => {
    render(<Title m="0px">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`margin: 0px 0px 0px 0px;`);
    expect(text).toHaveStyle(`margin-top: 0px;`);
    expect(text).toHaveStyle(`margin-bottom: 0px;`);
    expect(text).toHaveStyle(`margin-left: 0px;`);
    expect(text).toHaveStyle(`margin-right: 0px;`);
  });

  it('renders with correct vertical margin', () => {
    render(<Title my="1px">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`margin-top: 1px;`);
    expect(text).toHaveStyle(`margin-bottom: 1px;`);
  });

  it('renders with correct bottom margin', () => {
    render(<Title mb="2px">Test title</Title>);
    const text = screen.getByRole('heading');

    expect(text).toHaveStyle(`margin-bottom: 2px;`);
  });
});
