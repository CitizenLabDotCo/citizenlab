import React, { ReactNode } from 'react';

import { Icon, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import CookieModalContentContainer from './CookieModalContentContainer';
import messages from './messages';

export const COOKIE_MODAL_TITLE_ID = 'cookie-modal-title';

interface Props {
  id?: string;
  /**
   * When provided, this plain-text string is appended to the focused title's
   * aria-label so VoiceOver reads it after the title on modal open. Use a
   * plain string (no markup) — aria-label is a direct value, not a reference.
   */
  extraLabelText?: string;
  children?: ReactNode;
}

const BaseMainContent = ({ id, extraLabelText, children }: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const siteName =
    appConfiguration?.data.attributes.settings.core.organization_name || null;

  const titleLabel = `${formatMessage(messages.cookieModalTitle)}${
    siteName ? ` - ${localize(siteName)}` : ''
  }`;
  const ariaLabel = extraLabelText
    ? `${titleLabel}. ${extraLabelText}`
    : undefined;

  return (
    <CookieModalContentContainer id={id}>
      <Icon name="cookie" fill={theme.colors.tenantPrimary} />
      <Title
        as="h1"
        id={COOKIE_MODAL_TITLE_ID}
        variant={isSmallerThanPhone ? 'h4' : 'h3'}
        tabIndex={-1}
        data-autofocus
        aria-label={ariaLabel}
      >
        <FormattedMessage {...messages.cookieModalTitle} />
        {siteName && <> - {localize(siteName)}</>}
      </Title>
      {children}
    </CookieModalContentContainer>
  );
};

export default BaseMainContent;
