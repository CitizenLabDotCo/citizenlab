import React from 'react';

import { CLErrors } from 'typings';

import AffixField from 'design-system/AffixField';
import Banner from 'design-system/Banner';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import useApiErrorText from 'components/admin/MultilocFields/useApiErrorText';
import messages from 'components/admin/SlugInput/messages';
import slugInputMessages from 'components/HookForm/SlugInput/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './SlugInput.module.css';
import 'design-system/tokens.css';

interface Props {
  slug: string;
  apiErrors: CLErrors | null;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
  showSlugChangedWarning: boolean;
}

const SlugInput = ({
  slug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  showSlugChangedWarning,
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
    <div className={styles.slugInput}>
      <AffixField
        label={formatMessage(slugInputMessages.urlSlugLabel)}
        prefix={`${hostName}/${locale}/projects/`}
        value={slug}
        onChange={onSlugChange}
        labelTooltip={formatMessage(slugInputMessages.slugTooltip)}
        isInvalid={!!errorMessage}
        errorMessage={errorMessage}
      />
      {showSlugChangedWarning && (
        <Banner tone="warning">
          {formatMessage(slugInputMessages.urlSlugBrokenLinkWarning)}
        </Banner>
      )}
    </div>
  );
};

export default SlugInput;
