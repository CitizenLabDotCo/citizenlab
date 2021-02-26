import React, { ReactElement, FormEvent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import messages from './messages';
import FranceConnectLogo from './FranceConnectLogo';
import { ScreenReaderOnly } from 'utils/a11y';

const FranceConnectButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const FranceConnectButtonLink = styled.button`
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: auto;
  text-align: left;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-bottom: 8px;
  border: none;

  #france-connect-background {
    transition: fill 0.2s ease-in-out;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:hover #france-connect-background {
    fill: #3483f2;
  }
`;

const SubSocialButtonLink = styled.a`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  line-height: 1;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface Props {
  onClick: (event: FormEvent) => void;
  logoAlt: string;
}

const FranceConnectButton = ({ onClick, logoAlt }: Props): ReactElement => {
  return (
    <FranceConnectButtonWrapper>
      <FranceConnectButtonLink onClick={onClick}>
        <FranceConnectLogo />
        <ScreenReaderOnly>{logoAlt}</ScreenReaderOnly>
      </FranceConnectButtonLink>
      <SubSocialButtonLink
        href="https://app.franceconnect.gouv.fr/en-savoir-plus"
        target="_blank"
      >
        <FormattedMessage {...messages.whatIsFranceConnect} />
      </SubSocialButtonLink>
    </FranceConnectButtonWrapper>
  );
};

export default FranceConnectButton;
