import React, { PureComponent } from 'react';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';
import { stylingConsts, media } from 'utils/styleUtils';
import bowser from 'bowser';

const Outer = styled.div`
  width: 100%;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;

  ${media.smallerThanMinTablet`
    padding-left: 15px;
    padding-right: 15px;
  `}

  &:not(.ie) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Inner: any = styled.div<{ maxWidth?: string }>`
  width: 100%;
  max-width: ${({ maxWidth }) =>
    isNumber(maxWidth) ? `${maxWidth}px` : maxWidth};
  z-index: 1;

  &.ie {
    margin-left: auto;
    margin-right: auto;
  }
`;

interface Props {
  children?: any;
  id?: string;
  className?: string;
  mode?: 'oldPage' | 'banner' | 'page' | 'text';
  maxWidth?: number | string;
}

interface State {}

export default class ContentContainer extends PureComponent<Props, State> {
  render() {
    const { mode, id, className, children } = this.props;
    let maxWidth = this.props.maxWidth;

    if (!maxWidth) {
      if (mode === 'banner') {
        maxWidth = stylingConsts.bannerWidth;
      } else if (mode === 'page') {
        maxWidth = stylingConsts.pageWidth;
      } else if (mode === 'text') {
        maxWidth = stylingConsts.textWidth;
      } else {
        maxWidth = stylingConsts.maxPageWidth;
      }
    }

    return (
      <Outer
        id={id || ''}
        className={`${className} ${bowser.msie ? 'ie' : ''}`}
      >
        <Inner
          className={`inner ${bowser.msie ? 'ie' : ''}`}
          maxWidth={maxWidth}
        >
          {children}
        </Inner>
      </Outer>
    );
  }
}
