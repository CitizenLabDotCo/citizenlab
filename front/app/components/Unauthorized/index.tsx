import React from 'react';

import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import Button from 'components/UI/Button';
import Centerer from 'components/UI/Centerer';

import { useIntl } from 'utils/cl-intl';

import pageNotFoundMessages from '../PageNotFound/messages';

import messages from './messages';

type UnauthorizedProps = {
  fixableByAuthentication?: boolean;
  triggerAuthFlow?: () => void;
};

const Unauthorized = ({
  fixableByAuthentication = false,
  triggerAuthFlow,
}: UnauthorizedProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const { data: authUser, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <Centerer h="500px">
        <Spinner />
      </Centerer>
    );
  }

  const signIn = () => {
    triggerAuthenticationFlow({
      flow: 'signin',
    });
  };

  return (
    <Box
      height={`calc(100vh - ${theme.menuHeight + theme.footerHeight})`}
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="4rem"
      id="e2e-not-authorized"
      as="main"
    >
      {authUser ? (
        fixableByAuthentication ? (
          <>
            <Title mb="0">{formatMessage(messages.completeProfileTitle)}</Title>
            <Text fontSize="l" color="textSecondary" mb="20px">
              {formatMessage(messages.additionalInformationRequired)}
            </Text>
            <Box mb="16px">
              <Button
                onClick={() => {
                  triggerAuthFlow?.();
                }}
                text={formatMessage(messages.completeProfile)}
                data-cy="e2e-trigger-authentication"
              />
            </Box>
          </>
        ) : (
          <>
            <Title mb="0">{formatMessage(messages.noPermission)}</Title>
            <Text fontSize="l" color="textSecondary" mb="30px">
              {formatMessage(messages.notAuthorized)}
            </Text>
            <Button
              linkTo="/"
              text={formatMessage(pageNotFoundMessages.goBackToHomePage)}
              icon="arrow-left"
            />
          </>
        )
      ) : (
        <>
          <Title mb="0">{formatMessage(messages.noPermission)}</Title>
          <Text fontSize="l" color="textSecondary" mb="20px">
            {formatMessage(messages.sorryNoAccess)}
          </Text>
          <Box mb="16px" data-cy="e2e-unauthorized-must-sign-in">
            <Button
              onClick={() => {
                triggerAuthFlow ? triggerAuthFlow() : signIn();
              }}
              text={formatMessage(messages.signIn)}
              data-cy="e2e-trigger-authentication"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Unauthorized;
