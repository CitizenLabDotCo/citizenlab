import React from 'react';

import { stylingConsts, media } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';

const Outer = styled.div`
  width: 100%;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${media.phone`
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const Inner = styled.div<{ maxWidth?: string | number }>`
  width: 100%;
  max-width: ${({ maxWidth }) =>
    isNumber(maxWidth) ? `${maxWidth}px` : maxWidth};
`;

export interface Props {
  children?: any;
  id?: string;
  className?: string;
  mode?: 'oldPage' | 'banner' | 'page' | 'text';
  maxWidth?: number | string;
}

const ContentContainer = ({
  mode,
  id,
  className,
  children,
  maxWidth,
}: Props) => {
  let newMaxWidth = maxWidth;

  if (!maxWidth) {
    if (mode === 'banner') {
      newMaxWidth = stylingConsts.bannerWidth;
    } else if (mode === 'page') {
      newMaxWidth = stylingConsts.pageWidth;
    } else if (mode === 'text') {
      newMaxWidth = stylingConsts.textWidth;
    } else {
      newMaxWidth = stylingConsts.maxPageWidth;
    }
  }

  return (
    <Outer id={id} className={className}>
      <Inner maxWidth={newMaxWidth}>{children}</Inner>
    </Outer>
  );
};

export default ContentContainer;
