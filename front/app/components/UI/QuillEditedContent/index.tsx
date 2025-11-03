import React, { useRef, useEffect } from 'react';

import { quillEditedContent } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

const Container = styled.div<{
  textColor: Props['textColor'];
  mentionColor: Props['mentionColor'];
  fontSize: Props['fontSize'];
  fontWeight: Props['fontWeight'];
}>`
  ${(props) =>
    quillEditedContent(
      props.theme.colors.tenantPrimary,
      props.textColor,
      props.mentionColor,
      props.fontSize,
      props.fontWeight
    )}
`;

interface Props {
  disableTabbing?: boolean;
  textColor?: string;
  mentionColor?: string;
  fontSize?: 's' | 'base' | 'm' | 'l';
  fontWeight?: 300 | 400;
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

const QuillEditedContent = ({
  textColor,
  mentionColor,
  fontSize,
  fontWeight,
  children,
  className,
  disableTabbing,
}: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const tabbableElements = containerRef.current.querySelectorAll(
      'a, iframe, button, input, select, textarea'
    );

    for (const item of tabbableElements) {
      item.setAttribute('tabindex', disableTabbing ? '-1' : '0');
    }

    // Fix YouTube iframes - add referrerpolicy
    const iframes = containerRef.current.querySelectorAll('iframe');

    for (const iframe of iframes) {
      const src = iframe.getAttribute('src');

      if (
        src &&
        (src.includes('youtube.com/embed') ||
          src.includes('youtube-nocookie.com/embed'))
      ) {
        iframe.setAttribute('referrerpolicy', 'origin');
      }
    }
  }, [disableTabbing, children]);

  return (
    <Container
      textColor={textColor}
      mentionColor={mentionColor || theme.colors.tenantText}
      fontSize={fontSize}
      fontWeight={fontWeight}
      className={className || ''}
      ref={containerRef}
    >
      {children}
    </Container>
  );
};

export default QuillEditedContent;
