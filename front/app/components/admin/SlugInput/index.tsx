import React from 'react';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { Text, Input } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import Error from 'components/UI/Error';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import slugInputMessages from 'components/HookForm/SlugInput/messages';
import messages from './messages';

// typings
import { CLErrors } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

type TApiErrors = CLErrors | null;

export interface Props {
  slug: string;
  pathnameWithoutSlug: 'projects' | 'folders';
  apiErrors: TApiErrors;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
  showSlugChangedWarning: boolean;
}

const SlugInput = ({
  slug,
  pathnameWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  showSlugChangedWarning,
}: Props) => {
  const locale = useLocale();
  const appConfig = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!isNilOrError(locale) && !isNilOrError(appConfig)) {
    const hostName = appConfig.attributes.host;
    const previewUrl = `${hostName}/${locale}/${pathnameWithoutSlug}/${slug}`;

    return (
      <>
        <Input
          label={formatMessage(slugInputMessages.urlSlugLabel)}
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
