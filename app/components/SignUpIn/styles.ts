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

  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
  `}
`;

export const Option = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-top: 20px;

  & .link {
    color: ${(props: any) => props.theme.colorText};
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
    color: ${(props: any) => props.theme.colorText};
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

export const StyledHeaderContainer = styled(HeaderContainer)<{
  inModal: boolean;
}>`
  ${(props) =>
    !props.inModal &&
    css`
      padding-top: 0px;
      background: transparent;
      border: none;

      ${media.smallerThanMinTablet`
        padding-top: 0px;
        padding-left: 2px;
        padding-right: 2px;
      `}
    `}
`;

export const StyledHeaderTitle = styled(HeaderTitle)<{ inModal: boolean }>`
  ${(props) =>
    !props.inModal &&
    css`
      font-size: ${fontSizes.xxxl}px;
    `}
`;

export const StyledModalContentContainer = styled(ModalContentContainer)<{
  inModal: boolean;
  windowHeight: string;
  headerHeight: string;
}>`
  ${(props) =>
    props.inModal &&
    css`
      padding-top: 20px;
      padding-bottom: 0px;
      max-height: calc(85vh - ${props.headerHeight});

      ${media.smallerThanMinTablet`
        max-height: ${(props) =>
          `calc(${props.windowHeight} - 30px - ${props.headerHeight})`};
      `}
    `}

  ${(props) =>
    !props.inModal &&
    css`
      padding-top: 10px;
      padding-bottom: 0px;

      ${media.smallerThanMinTablet`
        padding-top: 10px;
        padding-left: 2px;
        padding-right: 2px;
      `}
    `}
`;
