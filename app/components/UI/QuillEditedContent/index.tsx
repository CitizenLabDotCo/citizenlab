import React, { PureComponent } from 'react';
import styled, { withTheme } from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Container: any = styled.div`
  ${(props: any) => quillEditedContent(props.linkColor, props.textColor, props.fontSize, props.fontWeight )}
`;

interface Props {
  linkColor?: string;
  textColor?: string;
  fontSize?: 'base' | 'large';
  fontWeight?: 300 | 400;
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
  theme: any;
}

interface State {}

class QuillEditedContent extends PureComponent<Props, State> {
  render() {
    const { linkColor, textColor, fontSize, fontWeight, children, className, theme } = this.props;

    return (
      <Container
        linkColor={linkColor || theme.colorText}
        textColor={textColor}
        fontSize={fontSize}
        fontWeight={fontWeight}
        className={className}
      >
        {children}
      </Container>
    );
  }
}

export default withTheme<Props, State>(QuillEditedContent);
