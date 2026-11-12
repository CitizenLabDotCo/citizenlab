import React from 'react';

import styled from 'styled-components';
import twemoji from 'twemoji';

import { escapeHtml } from 'utils/textUtils';

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
  /**
   * Marks the emoji as decorative, giving it an empty alt text so assistive
   * technology skips it. Use it wherever the emoji sits next to a visible
   * label that already carries the meaning.
   */
  decorative?: boolean;
}

const Emoji: React.FC<Props> = ({
  emoji,
  size = '1em',
  className,
  decorative = false,
}) => {
  // In production, TWEMOJI_BASE_URL points at a content-hashed prefix on the
  // CDN (set at build time, see .circleci/config.yml) so immutable SVGs can
  // be cached aggressively. Locally it's unset and Vite serves them from
  // app/public/twemoji/ at /twemoji/.
  //
  // On a string, twemoji.parse only swaps emoji for <img> tags and passes all
  // other text through untouched, and the result goes into innerHTML.
  // Escaping first keeps anything that isn't an emoji as plain text. None of
  // the escaped characters is part of an emoji, so every emoji is still found.
  const parsed = twemoji.parse(escapeHtml(emoji), {
    folder: 'svg',
    ext: '.svg',
    base: process.env.TWEMOJI_BASE_URL || '/twemoji/',
  });

  // Twemoji hardcodes the emoji character as the alt text, and its `attributes`
  // option refuses to overwrite an attribute it has already written, so the
  // only way to blank it is to rewrite the generated markup.
  const html = decorative ? parsed.replace(/ alt="[^"]*"/, ' alt=""') : parsed;

  return (
    <EmojiWrapper
      size={size}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Emoji;
