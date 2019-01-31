import React from 'react';
import styled from 'styled-components';
import { quillEditedContent } from 'utils/styleUtils';

const Styles = styled.div`
  ${quillEditedContent()}
`;

interface Props {
  children: JSX.Element | JSX.Element[] | string;
}

const QuillEditedContent = ({ children }: Props) => {
  return (
    <Styles>
      {children}
    </Styles>
  );
};

export default QuillEditedContent;
