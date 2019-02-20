import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Styles: any = styled.div`
  ${(props: any) => quillEditedContent(props.fontSize, props.color, props.fontWeight)}
`;

interface Props {
  fontSize?: 'base' | 'large';
  color?: string;
  fontWeight?: 300 | 400;
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

interface State {}

export default class QuillEditedContent extends PureComponent<Props, State> {
  render() {
    const { fontSize, color, fontWeight, children, className } = this.props;

    return (
      <Styles
        className={className}
        fontSize={fontSize}
        color={color}
        fontWeight={fontWeight}
      >
        {children}
      </Styles>
    );
  }
}
