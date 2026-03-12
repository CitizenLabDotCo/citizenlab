import React from 'react';

import styled from 'styled-components';
import twemoji from 'twemoji';

const EmojiWrapper = styled.span<{ size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img.emoji {
    height: ${({ size }) => size};
    width: ${({ size }) => size};
    vertical-align: -0.1em;
  }
`;

interface Props {
  emoji: string;
  size?: string;
  className?: string;
}

const Emoji: React.FC<Props> = ({ emoji, size = '1em', className }) => {
  const parsed = twemoji.parse(emoji, {
    folder: 'svg',
    ext: '.svg',
    base: '/twemoji/',
  });

  return (
    <EmojiWrapper
      size={size}
      className={className}
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  );
};

export default Emoji;
