import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Image from '.';

const src = 'https://someimagesource.com/image.jpg';
const alt = "Some image's alt";

describe('<Image />', () => {
  it('renders with alt text', () => {
    render(<Image src={src} alt={alt} />);
    const image = screen.getByAltText(alt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', src);
  });

  it('renders with correct sizes attribute', () => {
    const sizes = '(max-width: 600px) 480px, 800px';
    render(<Image src={src} alt={alt} sizes={sizes} />);
    const image = screen.getByAltText(alt);
    expect(image).toHaveAttribute('sizes', sizes);
  });

  it('renders with correct loading attribute', () => {
    render(<Image src={src} loading="lazy" alt={alt} />);
    const image = screen.getByAltText(alt);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders with correct object fit', () => {
    render(<Image src={src} alt={alt} objectFit="contain" />);
    const image = screen.getByAltText(alt);
    expect(image).toHaveStyle({ objectFit: 'contain' });
  });
});
