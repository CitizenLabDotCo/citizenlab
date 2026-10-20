import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Input,
  colors,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import slugInputMessages from 'components/HookForm/SlugInput/messages';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  slug: string;
  pathnameWithoutSlug: 'projects' | 'folders';
  apiErrors: CLErrors | null;
  showSlugErrorMessage: boolean;
  onSlugChange: (slug: string) => void;
  showSlugChangedWarning: boolean;
}

const BoSlugInput = ({
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

  if (!appConfig) return null;

  const hostName = appConfig.data.attributes.host;
  const slugLabel = formatMessage(slugInputMessages.urlSlugLabel);

  return (
    <>
      <Box display="flex" alignItems="center" gap="4px" mb="4px">
        <Text variant="boControl" fontSize="xs" m="0px">
          {slugLabel}
        </Text>
        <IconTooltip
          content={formatMessage(slugInputMessages.slugTooltip)}
          icon="info-outline"
          iconSize="14px"
          iconColor={colors.coolGrey500}
        />
      </Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Text variant="boMicro" color="coolGrey500" whiteSpace="nowrap" m="0px">
          {`${hostName}/${locale}/${pathnameWithoutSlug}/`}
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
      {apiErrors && <Error fieldName="slug" apiErrors={apiErrors.slug} />}
      {showSlugErrorMessage && (
        <Error text={formatMessage(messages.regexError)} />
      )}
    </>
  );
};

export default BoSlugInput;
