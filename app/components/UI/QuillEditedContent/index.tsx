import React from 'react';
import styled from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Styles = styled.div`
  ${quillEditedContent()}
`;

interface Props {
  children: JSX.Element | JSX.Element[] | string;
  className?: string;
}

const QuillEditedContent = ({ children, className }: Props) => {
  return (
    <Styles className={className}>
      {children}
    </Styles>
  );
};

export default QuillEditedContent;
