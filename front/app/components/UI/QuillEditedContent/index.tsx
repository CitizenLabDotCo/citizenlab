import React, { useRef, useEffect } from 'react';
import styled, { withTheme } from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Container: any = styled.div`
  ${(props: any) =>
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
  theme: any;
}

const QuillEditedContent = ({
  linkColor,
  textColor,
  mentionColor,
  fontSize,
  fontWeight,
  children,
  className,
  theme,
  disableTabbing,
}: Props) => {
  const containerRef = useRef<HTMLElement | null>(null);

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

export default withTheme(QuillEditedContent);
