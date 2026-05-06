import React, { ReactNode } from 'react';

import { Icon, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';

import CookieModalContentContainer from './CookieModalContentContainer';
import messages from './messages';

export const COOKIE_MODAL_TITLE_ID = 'cookie-modal-title';

interface Props {
  id?: string;
  children?: ReactNode;
}

const BaseMainContent = ({ id, children }: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();
  const { data: appConfiguration } = useAppConfiguration();
  const siteName =
    appConfiguration?.data.attributes.settings.core.organization_name || null;

  return (
    <CookieModalContentContainer id={id}>
      <Icon name="cookie" fill={theme.colors.tenantPrimary} />
      <Title
        as="h1"
        id={COOKIE_MODAL_TITLE_ID}
        variant={isSmallerThanPhone ? 'h4' : 'h3'}
        tabIndex={-1}
        data-autofocus
      >
        <FormattedMessage {...messages.cookieModalTitle} />
        {siteName && <> - {localize(siteName)}</>}
      </Title>
      {children}
    </CookieModalContentContainer>
  );
};

export default BaseMainContent;
