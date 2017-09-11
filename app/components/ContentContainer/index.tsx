import * as React from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Outer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px;
  ${media.phone`
    padding: 0 15px;
  `};
`;

const Inner = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
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
