import React from 'react';

import { render } from 'utils/testUtils/rtl';

import Emoji from '.';

describe('Emoji', () => {
  it('renders an emoji as a twemoji image', () => {
    const { container } = render(<Emoji emoji="🚲" />);
    const img = container.querySelector('img.emoji');

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '🚲');
  });

  it('blanks the alt text when decorative', () => {
    const { container } = render(<Emoji emoji="🚲" decorative />);

    expect(container.querySelector('img.emoji')).toHaveAttribute('alt', '');
  });

  it('renders markup as text instead of HTML', () => {
    const payload = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const { container } = render(<Emoji emoji={payload} />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('script')).not.toBeInTheDocument();
    expect(container).toHaveTextContent(payload);
  });

  it('still turns emoji into images when they are mixed with markup', () => {
    const { container } = render(<Emoji emoji="🚲<b>bold</b>" />);

    expect(container.querySelectorAll('img.emoji')).toHaveLength(1);
    expect(container.querySelector('b')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('<b>bold</b>');
  });
});
