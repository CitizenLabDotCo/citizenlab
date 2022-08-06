import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Wrapper = styled.div`
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${(props) => props.theme.colors.separation};
  box-sizing: border-box;
  padding: 3.5rem 4rem;
  margin-bottom: 0px;

  ${media.smallerThan1280px`
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

interface Props {
  className?: string;
  children: ReactNode;
}

const PageWrapper = ({ className, children }: Props) => {
  return <Wrapper className={className}>{children}</Wrapper>;
};

export default PageWrapper;
