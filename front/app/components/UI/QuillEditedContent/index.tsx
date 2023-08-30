import React, { useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Container = styled.div<{
  linkColor: Props['linkColor'];
  textColor: Props['textColor'];
  mentionColor: Props['mentionColor'];
  fontSize: Props['fontSize'];
  fontWeight: Props['fontWeight'];
}>`
  ${(props) =>
    quillEditedContent(
      props.theme.colors.tenantPrimary,
      props.linkColor,
      props.textColor,
      props.mentionColor,
      props.fontSize,
      props.fontWeight
    )}
`;

interface Props {
  disableTabbing?: boolean;
  linkColor?: string;
  textColor?: string;
  mentionColor?: string;
  fontSize?: 's' | 'base' | 'm' | 'l';
  fontWeight?: 300 | 400;
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

const QuillEditedContent = ({
  linkColor,
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
      }
    }
  }, [disableTabbing, tabbableElements]);

  return (
    <Container
      linkColor={linkColor}
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
