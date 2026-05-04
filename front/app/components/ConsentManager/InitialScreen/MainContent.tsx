import React from 'react';

import { colors, fontSizes, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import BaseMainContent from '../BaseMainContent';
import messages from '../messages';

const TextLink = typedStyled(Link)`
  font-size: ${fontSizes.base}px;
  color: ${colors.textPrimary};
  text-decoration: underline;

  &:hover {
    color: ${colors.textPrimary};
    text-decoration: underline;
  }
`;

const MainContent = () => {
  return (
    <BaseMainContent>
      <Text>
        <FormattedMessage
          {...messages.cookieModalInitialScreenDescription}
          values={{
            linkToCookiePolicy: (
              <TextLink
                target="_blank"
                to="/$locale/pages/cookie-policy"
                search={{ from: 'cookie-modal' }}
              >
                <FormattedMessage {...messages.linkToCookiePolicyText} />
              </TextLink>
            ),
          }}
        />
      </Text>
    </BaseMainContent>
  );
};

export default MainContent;
