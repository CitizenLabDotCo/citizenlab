import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Styles: any = styled.div`
  ${(props: any) => quillEditedContent(props.fontSize)}
`;

interface Props {
  fontSize?: 'base' | 'large';
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

interface State {}

export default class QuillEditedContent extends PureComponent<Props, State> {
  render() {
    const { fontSize, children, className } = this.props;

    return (
      <Styles className={className} fontSize={fontSize}>
        {children}
      </Styles>
    );
  }
}
