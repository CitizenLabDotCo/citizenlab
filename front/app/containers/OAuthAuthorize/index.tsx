import React, { useEffect, useState } from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Spinner,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useCreateOAuthAuthorization from 'api/oauth_authorization/useCreateOAuthAuthorization';
import useOAuthAuthorization from 'api/oauth_authorization/useOAuthAuthorization';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useSearch } from 'utils/router';

import Card from './components/Card';
import IconBadge from './components/IconBadge';
import InfoCard from './components/InfoCard';
import messages from './messages';
import { isSafeRedirectUrl, navigateToUrl } from './utils';

const scopeContent = (scope: string) => {
  switch (scope) {
    case 'mcp:access':
      return {
        title: <FormattedMessage {...messages.scopeMcpAccessTitle} />,
        detail: <FormattedMessage {...messages.scopeMcpAccessDetail} />,
      };
    default:
      return {
        title: (
          <FormattedMessage
            {...messages.scopeFallbackTitle}
            values={{ scope }}
          />
        ),
        detail: <FormattedMessage {...messages.scopeFallbackDetail} />,
      };
  }
};

const OAuthAuthorize = () => {
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');
  const theme = useTheme();
  const menuHeight = isTabletOrSmaller
    ? theme.mobileTopBarHeight + theme.mobileMenuHeight
    : theme.menuHeight + theme.footerHeight;
  // Typed, validated OAuth params from the URL — same mechanism as our other
  // external-redirect params (SSO, verification). See oauthAuthorizeSearchSchema.
  const params = useSearch({ from: '/$locale/oauth/authorize' });

  const { data: authUser, isLoading: authLoading } = useAuthUser();
  const loggedIn = !!authUser;

  const {
    data: authorization,
    isLoading: detailsLoading,
    isError,
  } = useOAuthAuthorization(params, { enabled: loggedIn });

  const { mutate: authorize, isPending: authorizing } =
    useCreateOAuthAuthorization();

  const [redirectBlocked, setRedirectBlocked] = useState(false);

  // A client is registered with a redirect_uri of its choosing, so the URI we
  // are asked to send the user back to is attacker-controlled. Refuse the whole
  // consent screen when the scheme is not http(s), rather than only guarding the navigation.
  const unsafeRedirect =
    !authorization ||
    !isSafeRedirectUrl(authorization.data.attributes.redirect_uri);

  // Single choke point for leaving the platform: window.location never receives
  // a URL whose scheme we have not validated ourselves.
  const navigateToClient = (url: string) => {
    if (!isSafeRedirectUrl(url)) {
      setRedirectBlocked(true);
      return;
    }
    navigateToUrl(url);
  };

  // Not logged in: open the normal sign-in flow in place. Once authenticated,
  // authUser updates and the consent details load. The OAuth params live in the
  // URL, which the in-page auth modal does not change, so they survive sign-in.
  useEffect(() => {
    if (!authLoading && !loggedIn) {
      triggerAuthenticationFlow();
    }
  }, [authLoading, loggedIn]);

  let content: React.ReactNode;

  if (authLoading || (loggedIn && detailsLoading)) {
    content = (
      <Box p="48px" display="flex" justifyContent="center" width="100%">
        <Spinner />
      </Box>
    );
  } else if (!loggedIn) {
    content = (
      <Card>
        <Box p="40px" display="flex" flexDirection="column" gap="16px">
          <Text m="0px" color="textSecondary">
            <FormattedMessage {...messages.signInPrompt} />
          </Text>
          <Button
            buttonStyle="primary"
            onClick={() => triggerAuthenticationFlow()}
          >
            <FormattedMessage {...messages.signInButton} />
          </Button>
        </Box>
      </Card>
    );
  } else if (isError || unsafeRedirect || redirectBlocked) {
    content = (
      <Card>
        <Box p="40px">
          <IconBadge name="shield-checkered" />
          <Title variant="h2" color="tenantText" mt="16px">
            <FormattedMessage {...messages.invalidRequestHeading} />
          </Title>
          <Text color="textSecondary">
            <FormattedMessage {...messages.invalidRequestExplanation} />
          </Text>
        </Box>
      </Card>
    );
  } else {
    const {
      client_name,
      scopes,
      redirect_uri,
      params: echoedParams,
    } = authorization.data.attributes;

    const handleAuthorize = () => {
      authorize(echoedParams, {
        onSuccess: (res) => {
          navigateToClient(res.data.attributes.redirect_uri);
        },
      });
    };

    // Denial persists nothing server-side: redirect the client back with
    // error=access_denied. The server validated this redirect_uri as one
    // registered for the client; the scheme check above is what makes it safe
    // to navigate to.
    const handleDeny = () => {
      const url = new URL(redirect_uri);
      url.searchParams.set('error', 'access_denied');
      if (params.state) {
        url.searchParams.set('state', params.state);
      }
      navigateToClient(url.toString());
    };

    content = (
      <Card>
        <Box
          flex="1"
          p={isTabletOrSmaller ? '24px' : '40px'}
          display="flex"
          flexDirection="column"
          minWidth="0"
        >
          <IconBadge name="shield-checkered" />

          <Title variant="h2" color="tenantText" mt="20px" mb="8px">
            <FormattedMessage
              {...messages.authorizeHeading}
              values={{ clientName: client_name }}
            />
          </Title>
          {/* Brand accent underline */}
          <Box
            width="48px"
            height="3px"
            borderRadius="2px"
            background={colors.teal500}
            mb="16px"
          />

          <Text mt="0px" mb="20px" color="textSecondary">
            <FormattedMessage
              {...messages.authorizeExplanation}
              values={{ clientName: client_name }}
            />
          </Text>

          <Box display="flex" flexDirection="column" gap="12px" mb="24px">
            {scopes.map((scope) => {
              const { title, detail } = scopeContent(scope);
              return (
                <InfoCard
                  key={scope}
                  icon={<IconBadge name="file" />}
                  title={title}
                  detail={detail}
                />
              );
            })}
            <InfoCard
              icon={<IconBadge name="shield-check" />}
              title={<FormattedMessage {...messages.inControlTitle} />}
              detail={
                <FormattedMessage
                  {...messages.inControlDetail}
                  values={{ clientName: client_name }}
                />
              }
            />
          </Box>

          <Box display="flex" flexDirection="column" gap="8px">
            <Button
              buttonStyle="admin-dark"
              icon="lock"
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
        </Box>
      </Card>
    );
  }

  return (
    <Box
      as="main"
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight={`calc(100vh - ${menuHeight}px)`}
      background={colors.background}
      p={isTabletOrSmaller ? '12px' : '24px'}
    >
      {content}
    </Box>
  );
};

export default OAuthAuthorize;
