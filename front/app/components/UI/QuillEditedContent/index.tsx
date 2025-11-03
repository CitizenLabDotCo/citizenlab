import React, { useRef, useEffect } from 'react';

import { quillEditedContent } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { isYouTubeEmbedLink } from 'utils/urlUtils';

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

  const tabbableElements = containerRef.current?.querySelectorAll(
    'a, iframe, button, input, select, textarea'
  );

  useEffect(() => {
    if (tabbableElements) {
      for (const item of tabbableElements) {
        item.setAttribute('tabindex', disableTabbing ? '-1' : '0');

        // Add referrerpolicy to YouTube iframes for proper embedding
        if (item.tagName === 'IFRAME') {
          const iframe = item as HTMLIFrameElement;
          if (isYouTubeEmbedLink(iframe.src)) {
            iframe.setAttribute(
              'referrerpolicy',
              'strict-origin-when-cross-origin'
            );
          }
        }
      }
    }
  }, [disableTabbing, tabbableElements]);

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
