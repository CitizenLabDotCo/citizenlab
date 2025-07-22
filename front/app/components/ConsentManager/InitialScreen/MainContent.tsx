import React from 'react';

import {
  colors,
  fontSizes,
  Icon,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import CookieModalContentContainer from '../CookieModalContentContainer';
import messages from '../messages';

const TextLink = styled(Link)`
  font-size: ${fontSizes.base}px;
  color: ${colors.textPrimary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;

const MainContent = () => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id="e2e-cookie-banner">
      <Icon name="cookie" fill={colors.primary} />
      <Title fontSize={isSmallerThanPhone ? 'xl' : undefined}>
        <FormattedMessage {...messages.cookieModalInitialScreenTitle} />
      </Title>
      <Text>
        <FormattedMessage
          {...messages.cookieModalInitialScreenDescription}
          values={{
            linkToCookiePolicy: (
              <TextLink
                target="_blank"
                to="/pages/cookie-policy?from=cookie-modal"
              >
                <FormattedMessage {...messages.linkToCookiePolicyText} />
              </TextLink>
            ),
          }}
        />
      </Text>
    </CookieModalContentContainer>
  );
};

export default MainContent;
