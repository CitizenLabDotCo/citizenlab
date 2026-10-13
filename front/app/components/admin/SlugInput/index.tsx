import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Input,
} from '@citizenlab/cl2-component-library';
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
  variant?: 'default' | 'bo';
}

const SlugInput = ({
  intercomLabelClassname,
  slug,
  pathnameWithoutSlug,
  apiErrors,
  showSlugErrorMessage,
  onSlugChange,
  showSlugChangedWarning,
  variant = 'default',
}: Props) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();

  if (!appConfig) return null;

  const hostName = appConfig.data.attributes.host;
  const urlPrefix = `${hostName}/${locale}/${pathnameWithoutSlug}/`;
  const slugLabel = formatMessage(slugInputMessages.urlSlugLabel);

  const errors = (
    <>
      {/* Backend error */}
      {apiErrors && <Error fieldName="slug" apiErrors={apiErrors.slug} />}
      {/* Frontend error */}
      {showSlugErrorMessage && (
        <Error text={formatMessage(messages.regexError)} />
      )}
    </>
  );

  if (variant === 'bo') {
    return (
      <>
        <Box display="flex" alignItems="center" gap="4px" mb="4px">
          <Text variant="boMicro" color="textPrimary" m="0px">
            {slugLabel}
          </Text>
          <IconTooltip
            content={formatMessage(slugInputMessages.slugTooltip)}
            iconSize="14px"
          />
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Text
            variant="boMicro"
            color="coolGrey500"
            whiteSpace="nowrap"
            m="0px"
          >
            {urlPrefix}
          </Text>
          <Box flex="1" minWidth="0">
            <Input
              variant="bo"
              type="text"
              ariaLabel={slugLabel}
              value={slug}
              onChange={onSlugChange}
            />
          </Box>
        </Box>
        {showSlugChangedWarning && (
          <Text variant="boMicro" color="coolGrey700" mt="8px" mb="0px">
            {formatMessage(slugInputMessages.urlSlugBrokenLinkWarning)}
          </Text>
        )}
        {errors}
      </>
    );
  }

  return (
    <>
      <Input
        label={<span className={intercomLabelClassname}>{slugLabel}</span>}
        labelTooltipText={formatMessage(slugInputMessages.slugTooltip)}
        type="text"
        onChange={onSlugChange}
        value={slug}
      />
      <Text mb={showSlugChangedWarning ? '16px' : '0'}>
        <i>
          <FormattedMessage {...slugInputMessages.resultingURL} />
        </i>
        : {`${urlPrefix}${slug}`}
      </Text>
      {showSlugChangedWarning && (
        <Warning>
          <FormattedMessage {...slugInputMessages.urlSlugBrokenLinkWarning} />
        </Warning>
      )}
      {errors}
    </>
  );
};

export default SlugInput;
