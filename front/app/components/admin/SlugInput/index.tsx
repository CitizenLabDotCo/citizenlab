import React from 'react';

import { Text, Input } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import slugInputMessages from 'components/HookForm/SlugInput/messages';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type TApiErrors = CLErrors | null;

export interface Props {
  intercomLabelClassname?: string;
  slug: string;
  pathnameWithoutSlug: 'projects' | 'folders';
  apiErrors: TApiErrors;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
  showSlugChangedWarning: boolean;
}

const SlugInput = ({
  intercomLabelClassname,
  slug,
  pathnameWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  showSlugChangedWarning,
}: Props) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (appConfig) {
    const hostName = appConfig.data.attributes.host;
    const previewUrl = `${hostName}/${locale}/${pathnameWithoutSlug}/${slug}`;

    return (
      <>
        <Input
          label={
            <span className={intercomLabelClassname}>
              {formatMessage(slugInputMessages.urlSlugLabel)}
            </span>
          }
          labelTooltipText={formatMessage(slugInputMessages.slugTooltip)}
          type="text"
          onChange={onSlugChange}
          value={slug}
        />
        <Text mb={showSlugChangedWarning ? '16px' : '0'}>
          <i>
            <FormattedMessage {...slugInputMessages.resultingURL} />
          </i>
          : {previewUrl}
        </Text>
        {showSlugChangedWarning && (
          <Warning>
            <FormattedMessage {...slugInputMessages.urlSlugBrokenLinkWarning} />
          </Warning>
        )}
        {/* Backend error */}
        {apiErrors && <Error fieldName="slug" apiErrors={apiErrors.slug} />}
        {/* Frontend error */}
        {showSlugErrorMessage && (
          <Error text={formatMessage(messages.regexError)} />
        )}
      </>
    );
  }

  return null;
};

export default SlugInput;
