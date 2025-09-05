import React, { ReactNode } from 'react';

import { Icon, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import CookieModalContentContainer from './CookieModalContentContainer';
import messages from './messages';

interface Props {
  id?: string;
  children?: ReactNode;
}

const BaseMainContent = ({ id, children }: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id={id}>
      <Icon name="cookie" fill={theme.colors.tenantPrimary} />
      <Title as="h1" variant={isSmallerThanPhone ? 'h4' : 'h3'}>
        <FormattedMessage {...messages.cookieModalTitle} />
      </Title>
      {children}
    </CookieModalContentContainer>
  );
};

export default BaseMainContent;
