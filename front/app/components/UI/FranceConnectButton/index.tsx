import React, { ReactElement, FormEvent } from 'react';

import { fontSizes, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import FranceConnectLogo from './FranceConnectLogo';
import messages from './messages';

const FranceConnectButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: ${colors.background};
  border-radius: ${(props) => props.theme.borderRadius};
`;

const FranceConnectTitle = styled.p`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 4px;
`;

const FranceConnectSubTitle = styled.p`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  text-align: center;
  margin-bottom: 2rem;
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

  // colors are copied from https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/bouton-franceconnect/
  color: #000091;
  &:hover {
    color: #1212ff;
  }
`;

const SubSocialButtonLink = styled.a`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
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
      <FranceConnectTitle>
        <FormattedMessage
          {...messages.useFranceConnectToLoginCreateOrVerifyYourAccount}
        />
      </FranceConnectTitle>
      <FranceConnectSubTitle>
        <FormattedMessage
          {...messages.franceConnectIsTheSolutionProposedByTheGovernment}
        />
      </FranceConnectSubTitle>
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
