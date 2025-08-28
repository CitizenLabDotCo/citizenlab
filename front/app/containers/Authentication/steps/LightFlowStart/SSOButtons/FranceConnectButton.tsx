import React from 'react';

import { Image, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import FranceConnectImage from './franceconnect.png';
import messages from './messages';

const Container = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);
  transition: all 100ms ease-out;

  &:hover {
    border-color: ${colors.grey800};
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
  }
`;

interface Props {
  onClick: () => void;
}

const FranceConnectButton = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  if (!appConfiguration) return null;

  return (
    <Container>
      <ButtonWithLink
        buttonStyle="white"
        iconSize="22px"
        fullWidth={true}
        justify="left"
        whiteSpace="wrap"
        padding="10px 18px"
        onClick={onClick}
      >
        <Image src={FranceConnectImage} alt="" height="28px" mr="8px" />
        {formatMessage(messages.continueWithFranceConnect)}
      </ButtonWithLink>
    </Container>
  );
};

export default FranceConnectButton;
