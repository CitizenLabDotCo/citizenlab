import React, { useEffect, useMemo } from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { OAuthAuthorizationParams } from 'api/oauth_authorization/types';
import useCreateOAuthAuthorization from 'api/oauth_authorization/useCreateOAuthAuthorization';
import useOAuthAuthorization from 'api/oauth_authorization/useOAuthAuthorization';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

// Reads the OAuth authorize params off the URL. They arrive verbatim from the
// client app's redirect (not SPA-internal navigation), so we read them straight
// from window.location rather than the typed router search.
const readParams = (): OAuthAuthorizationParams => {
  const sp = new URLSearchParams(window.location.search);
  return {
    client_id: sp.get('client_id') ?? '',
    response_type: sp.get('response_type') ?? '',
    redirect_uri: sp.get('redirect_uri') ?? '',
    scope: sp.get('scope') ?? undefined,
    state: sp.get('state') ?? undefined,
    code_challenge: sp.get('code_challenge') ?? undefined,
    code_challenge_method: sp.get('code_challenge_method') ?? undefined,
  };
};

const Centered = ({ children }: { children: React.ReactNode }) => (
  <Box
    as="main"
    minHeight="80vh"
    display="flex"
    justifyContent="center"
    alignItems="center"
    p="24px"
  >
    <Box
      width="100%"
      maxWidth="480px"
      p="32px"
      background={colors.white}
      borderRadius="3px"
      border={`1px solid ${colors.borderLight}`}
    >
      {children}
    </Box>
  </Box>
);

const scopeMessage = (scope: string) => {
  switch (scope) {
    case 'mcp:access':
      return <FormattedMessage {...messages.scopeMcpAccess} />;
    default:
      return (
        <FormattedMessage {...messages.scopeFallback} values={{ scope }} />
      );
  }
};

const OAuthAuthorize = () => {
  const { formatMessage } = useIntl();
  const params = useMemo(readParams, []);

  const { data: authUser, isLoading: authLoading } = useAuthUser();
  const loggedIn = !!authUser;

  const {
    data: authorization,
    isLoading: detailsLoading,
    isError,
  } = useOAuthAuthorization(params, { enabled: loggedIn });

  const { mutate: authorize, isLoading: authorizing } =
    useCreateOAuthAuthorization();

  // Not logged in: open the normal sign-in flow in place. Once authenticated,
  // authUser updates and the consent details load. The OAuth params live in the
  // URL, which the in-page auth modal does not change, so they survive sign-in.
  useEffect(() => {
    if (!authLoading && !loggedIn) {
      triggerAuthenticationFlow();
    }
  }, [authLoading, loggedIn]);

  if (authLoading || (loggedIn && detailsLoading)) {
    return (
      <Centered>
        <Box display="flex" justifyContent="center">
          <Spinner />
        </Box>
      </Centered>
    );
  }

  if (!loggedIn) {
    return (
      <Centered>
        <Text>
          <FormattedMessage {...messages.signInPrompt} />
        </Text>
        <Button onClick={() => triggerAuthenticationFlow()}>
          <FormattedMessage {...messages.signInButton} />
        </Button>
      </Centered>
    );
  }

  if (isError || !authorization) {
    return (
      <Centered>
        <Title variant="h2" color="red600">
          <FormattedMessage {...messages.invalidRequestHeading} />
        </Title>
        <Text>
          <FormattedMessage {...messages.invalidRequestExplanation} />
        </Text>
      </Centered>
    );
  }

  const {
    client_name,
    scopes,
    redirect_uri,
    params: echoedParams,
  } = authorization.data.attributes;

  const handleAuthorize = () => {
    authorize(echoedParams, {
      onSuccess: (res) => {
        window.location.assign(res.data.attributes.redirect_uri);
      },
    });
  };

  // Denial persists nothing server-side: redirect the client back with
  // error=access_denied, using the redirect_uri the server already validated.
  const handleDeny = () => {
    const url = new URL(redirect_uri);
    url.searchParams.set('error', 'access_denied');
    if (params.state) {
      url.searchParams.set('state', params.state);
    }
    window.location.assign(url.toString());
  };

  return (
    <Centered>
      <Title variant="h2">
        <FormattedMessage
          {...messages.authorizeHeading}
          values={{ clientName: client_name }}
        />
      </Title>
      <Text color="textSecondary">
        <FormattedMessage
          {...messages.authorizeExplanation}
          values={{ clientName: client_name }}
        />
      </Text>
      <Box as="ul" mt="16px" mb="24px" pl="20px">
        {scopes.map((scope) => (
          <Text key={scope} as="li" mb="4px">
            {scopeMessage(scope)}
          </Text>
        ))}
      </Box>
      <Box display="flex" gap="12px">
        <Button
          buttonStyle="primary"
          onClick={handleAuthorize}
          processing={authorizing}
          aria-label={formatMessage(messages.authorizeButton)}
        >
          <FormattedMessage {...messages.authorizeButton} />
        </Button>
        <Button
          buttonStyle="secondary-outlined"
          onClick={handleDeny}
          disabled={authorizing}
        >
          <FormattedMessage {...messages.denyButton} />
        </Button>
      </Box>
    </Centered>
  );
};

export default OAuthAuthorize;
