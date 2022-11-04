import React from 'react';
import styled, { css } from 'styled-components';
import { HeaderContainer, HeaderTitle } from 'components/UI/Modal';
import { fontSizes, defaultOutline, media } from 'utils/styleUtils';

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 30px;

  ${media.phone`
    margin-bottom: 20px;
  `}
`;

export const Option = styled.div`
  color: ${(props: any) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-top: 20px;

  & .link {
    color: ${(props: any) => props.theme.colors.tenantText};
    font-weight: 400;
    line-height: normal;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }

  & .button {
    display: flex;
    align-items: center;
    color: ${(props: any) => props.theme.colors.tenantText};
    font-size: ${fontSizes.base}px;
    font-weight: 300;
    line-height: normal;
    outline: none;

    &.focus-visible {
      ${defaultOutline};
    }

    &:hover {
      color: #000;
    }
  }

  & button {
    text-align: right;
    padding: 0;
    margin: 0;
    border: none;
    cursor: pointer;
  }
`;

export const StyledHeaderContainer = styled((props) => (
  <HeaderContainer {...props} />
))<{
  inModal: boolean;
}>`
  padding: 0;
  border: none;
  margin-bottom: 20px;

  ${(props) =>
    !props.inModal &&
    css`
      padding-top: 0px;
      background: transparent;
      border: none;

      ${media.phone`
        padding-top: 0px;
        padding-left: 2px;
        padding-right: 2px;
      `}
    `}
`;

export const StyledHeaderTitle = styled(HeaderTitle)`
  font-size: ${fontSizes.xxl}px;
`;
