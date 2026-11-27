import React from 'react';

import { CLErrors } from 'typings';

import AffixField from 'design-system/AffixField';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import messages from 'components/admin/SlugInput/messages';
import slugInputMessages from 'components/HookForm/SlugInput/messages';

import { useIntl } from 'utils/cl-intl';

import 'design-system/tokens.css';

interface Props {
  slug: string;
  apiErrors: CLErrors | null;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
}

const SlugInput = ({
  slug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
}: Props) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();
  const getApiErrorMessage = useApiErrorText();

  if (!appConfig) return null;

  const hostName = appConfig.data.attributes.host;
  const errorMessage = showSlugErrorMessage
    ? formatMessage(messages.regexError)
    : getApiErrorMessage(apiErrors?.slug, 'slug');

  return (
    <AffixField
      label={formatMessage(slugInputMessages.urlSlugLabel)}
      prefix={`${hostName}/${locale}/projects/`}
      prefixPlacement="outside"
      value={slug}
      onChange={onSlugChange}
      labelTooltip={formatMessage(slugInputMessages.slugTooltip)}
      description={formatMessage(slugInputMessages.urlSlugBrokenLinkWarning)}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
    />
  );
};

export default SlugInput;
