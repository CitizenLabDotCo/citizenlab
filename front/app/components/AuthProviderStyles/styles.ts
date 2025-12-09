import {
  Label,
  Image,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

export const FormContainer = styled.div<{ inModal: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.inModal ? 'center' : 'stretch')};
`;

export const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.xxl}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 0;
  margin-bottom: 35px;
  padding: 0;

  strong {
    font-weight: 600;
  }

  ${media.tablet`
    font-size: ${fontSizes.xl}px;
    margin-bottom: 20px;
  `}
`;

export const Form = styled.form<{ inModal: boolean }>`
  width: 100%;
  max-width: ${(props) => (props.inModal ? '380px' : 'unset')};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 10px;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 20px;
`;

export const StyledLabel = styled(Label)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const LabelTextContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

export const Footer = styled.div`
  display: flex;
  padding-top: 10px;
`;

export const SubmitButton = styled(ButtonWithLink)`
  margin-right: 10px;
`;

export const CancelButton = styled(ButtonWithLink)``;

export const HelpImage = styled(Image)`
  width: 100%;
`;
