import { Input, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ContentContainer from 'components/ContentContainer';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import PasswordIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';

export const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

export const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  margin-bottom: 50px;
`;

export const StyledButton = styled(ButtonWithLink)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

export const Form = styled.form`
  width: 100%;
  max-width: 380px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

export const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  &.margin-top {
    margin-top: 33px;
  }
`;

export const StyledPasswordIconTooltip = styled(PasswordIconTooltip)`
  margin-bottom: 6px;
`;

export const Subtitle = styled.p`
  color: #444;
  font-size: 18px;
  line-height: 22px;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;
  margin-bottom: 50px;
`;

export const StyledInput = styled(Input)``;
