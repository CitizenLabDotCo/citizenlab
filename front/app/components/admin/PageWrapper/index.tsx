import React, { ReactNode } from 'react';

import { media, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Wrapper = styled.div<{ flatTopBorder: boolean }>`
  background: #fff;
  border: ${stylingConsts.border};
  box-sizing: border-box;
  padding: 4rem 4rem;
  margin-bottom: 0px;

  ${(props) => {
    if (props.flatTopBorder) {
      return `
        border-bottom-left-radius: ${props.theme.borderRadius};
        border-bottom-right-radius: ${props.theme.borderRadius};
    `;
    } else {
      return `
        border-radius: ${props.theme.borderRadius};
    `;
    }
  }}

  ${media.tablet`
    padding: 2rem 2rem;
  `}
`;

export const ButtonWrapper = styled.div`
  display: flex;
  margin: 2em 0;
  padding: 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const PageWrapper = ({
  className,
  flatTopBorder = false,
  children,
}: {
  className?: string;
  // remove rounded border from the top of the container
  flatTopBorder?: boolean;
  children?: ReactNode;
}) => (
  <Wrapper className={className} flatTopBorder={flatTopBorder}>
    {children}
  </Wrapper>
);
export default PageWrapper;
