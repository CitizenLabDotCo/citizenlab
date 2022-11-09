import React from 'react';
import styled, { css } from 'styled-components';
import {
  HeaderContainer,
  HeaderTitle,
  ModalContentContainer,
} from 'components/UI/Modal';
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

export const StyledHeaderTitle = styled((props) => <HeaderTitle {...props} />)<{
  inModal: boolean;
}>`
  ${(props) =>
    !props.inModal &&
    css`
      font-size: ${fontSizes.xxxl}px;
    `}
`;

export const StyledModalContentContainer = styled(ModalContentContainer)<{
  inModal: boolean;
  headerHeight: string;
  fullScreen?: boolean;
}>`
  ${(props) =>
    props.inModal &&
    css`
      padding-top: 20px;
      padding-bottom: 0px;
      max-height: calc(85vh - ${props.headerHeight});

      ${media.phone`
        max-height: ${(props) => `calc(85vh - 30px - ${props.headerHeight})`};
      `}
    `}

  ${(props) =>
    !props.inModal &&
    css`
      padding-top: 10px;
      padding-bottom: 0px;

      ${media.phone`
        padding-top: 10px;
        padding-left: 2px;
        padding-right: 2px;
      `}
    `}

    ${(props) =>
    props.fullScreen &&
    css`
      max-height: 100%;

      ${media.phone`
          max-height: 100%;
        `}
    `}
`;
