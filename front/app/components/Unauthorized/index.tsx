import React from 'react';

// hooks
import useAuthUser from 'hooks/useAuthUser';

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

const Unauthorized = () => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

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
          <Box mb="16px">
            <Button onClick={signIn} text={formatMessage(messages.signIn)} />
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
