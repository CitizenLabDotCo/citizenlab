import React, { SFC } from 'react';
import styled from 'styled-components';
import { stylingConsts } from 'utils/styleUtils';

const Outer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-left: 20px;
  padding-right: 20px;
`;

const Inner: any = styled.div`
  width: 100%;
  max-width: ${(props: any) => props.maxWidth}px;
  z-index: 1;
`;

interface IContentContainer {
  children?: any;
  className?: string;
  mode?: 'oldPage' | 'banner' | 'page' | 'text';
}

const ContentContainer: SFC<IContentContainer> = ({ children, className, mode }) => {
  let maxWidth: number;
  if (mode === 'banner') {
    maxWidth = stylingConsts.bannerWidth;
  } else if (mode === 'page') {
    maxWidth = stylingConsts.pageWidth;
  } else if (mode === 'text') {
    maxWidth = stylingConsts.textWidth;
  } else {
    maxWidth = stylingConsts.maxPageWidth;
  }
  return (
    <Outer className={className}>
      <Inner className="inner" maxWidth={maxWidth} >
        {children}
      </Inner>
    </Outer>
  );
};

export default ContentContainer;
