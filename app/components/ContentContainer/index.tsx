import * as React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Outer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
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

const ContentContainer: React.SFC<IContentContainer> = ({ children, className }) => (
  <Outer className={className}>
    <Inner>
      {children}
    </Inner>
  </Outer>
);

interface IContentContainer {
  children?: any;
  className?: string;
}

export default ContentContainer;
