import React, { SFC } from 'react';
import styled from 'styled-components';

const Outer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
  z-index: 1;
`;

interface IContentContainer {
  children?: any;
  className?: string;
}

const ContentContainer: SFC<IContentContainer> = ({ children, className }) => {
  return (
    <Outer className={className}>
      <Inner className="inner">
        {children}
      </Inner>
    </Outer>
  );
};

export default ContentContainer;
