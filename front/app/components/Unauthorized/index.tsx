import React from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import { useTheme } from 'styled-components';

// components
import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Centerer from 'components/UI/Centerer';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import pageNotFoundMessages from '../PageNotFound/messages';

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
  const { data: authUser } = useAuthUser();

  const authUserPending = authUser === undefined;

  if (authUserPending) {
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

  const userIsNotLoggedIn = authUser === null;

  if (fixableByAuthentication && authUser) {
    return (
      <Box
        height={`calc(100vh - ${theme.menuHeight + theme.footerHeight})`}
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding="4rem"
        id="e2e-not-authorized"
      >
        <Title mb="0">{formatMessage(messages.completeProfileTitle)}</Title>
        <>
          <Text fontSize="l" color="textSecondary" mb="20px">
            {formatMessage(messages.additionalInformationRequired)}
          </Text>
          <Box mb="16px">
            <Button
              onClick={() => {
                triggerAuthFlow && triggerAuthFlow();
              }}
              text={formatMessage(messages.completeProfile)}
              data-cy="e2e-trigger-authentication"
            />
          </Box>
        </>
      </Box>
    );
  }

  return (
    <Box
      height={`calc(100vh - ${theme.menuHeight + theme.footerHeight})`}
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="4rem"
      id="e2e-not-authorized"
    >
      <Title mb="0">{formatMessage(messages.noPermission)}</Title>
      {userIsNotLoggedIn ? (
        <>
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
      ) : (
        <>
          <Text fontSize="l" color="textSecondary" mb="30px">
            {formatMessage(messages.notAuthorized)}
          </Text>
          <Button
            linkTo="/"
            text={formatMessage(pageNotFoundMessages.goBackToHomePage)}
            icon="arrow-left"
          />
        </>
      )}
    </Box>
  );
};

export default Unauthorized;
