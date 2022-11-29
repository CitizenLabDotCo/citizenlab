import React from 'react';
import Input from 'components/HookForm/Input';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

interface Props {
  slug?: string;
  pathnameWithoutSlug: string;
  showWarningMessage?: boolean;
}

const SlugInput = ({
  slug,
  pathnameWithoutSlug,
  showWarningMessage,
}: Props) => {
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  if (!isNilOrError(appConfig)) {
    const previewUrl = slug
      ? `${appConfig.attributes.host}/${locale}/${pathnameWithoutSlug}/${slug}`
      : null;

    return (
      <>
        {showWarningMessage && (
          <Box mb="16px">
            <Warning>
              <FormattedMessage {...messages.brokenURLWarning} />
            </Warning>
          </Box>
        )}
        <Input
          label={<FormattedMessage {...messages.pageUrl} />}
          labelTooltipText={<FormattedMessage {...messages.slugTooltip} />}
          id="slug"
          name="slug"
          type="text"
        />
        <Text>
          <b>
            <FormattedMessage {...messages.resultingPageURL} />
          </b>
          : {previewUrl}
        </Text>
      </>
    );
  }

  return null;
};

export default SlugInput;
