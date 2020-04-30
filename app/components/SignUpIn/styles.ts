import styled, { css } from 'styled-components';
import { colors, fontSizes, boxShadowOutline, media } from 'utils/styleUtils';
import { HeaderContainer, HeaderTitle, ModalContent } from 'components/UI/Modal';

export const Options = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 10px;
`;

export const Option = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  margin-top: 20px;

  & .link {
    color: ${colors.text};
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
    color: ${colors.text};
    font-size: ${fontSizes.base}px;
    font-weight: 300;
    line-height: normal;
    outline: none;

    &.focus-visible {
      ${boxShadowOutline};
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

export const StyledHeaderContainer = styled(HeaderContainer)<{ inModal: boolean }>`
  ${props => !props.inModal && css`
    padding-top: 0px;
    background: transparent;
    border: none;

    ${media.smallerThanMinTablet`
      padding-top: 0px;
      padding-left: 0px;
      padding-right: 0px;
    `}
  `}
`;

export const StyledHeaderTitle = styled(HeaderTitle)<{ inModal: boolean }>`
  ${props => !props.inModal && css`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

export const StyledModalContent = styled(ModalContent)<{ inModal: boolean }>`
  ${props => props.inModal && css`
    padding-top: 20px;
    max-height: calc(85vh - 150px);

    @media (min-width: 1025px) {
      max-height: calc(90vh - 150px);
    }

    ${media.smallerThanMinTablet`
      max-height: calc(85vh - 150px);
    `}
  `}

  ${props => !props.inModal && css`
    padding-bottom: 0px;
    padding-top: 10px;

    ${media.smallerThanMinTablet`
      padding: 0px;
      padding-top: 10px;
    `}
  `}
`;
