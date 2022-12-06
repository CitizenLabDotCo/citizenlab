import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import Input from 'components/HookForm/Input';
import Warning from 'components/UI/Warning';
import { SectionField } from 'components/admin/Section';
import messages from './messages';

interface Props {
  slug?: string;
  pathnameWithoutSlug: string;
}

const SlugInput = ({ slug, pathnameWithoutSlug }: Props) => {
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  if (!isNilOrError(appConfig)) {
    const previewUrl = slug
      ? `${appConfig.attributes.host}/${locale}/${pathnameWithoutSlug}/${slug}`
      : null;

    return (
      <SectionField>
        <Box mb="16px">
          <Warning>
            <FormattedMessage {...messages.brokenURLWarning} />
          </Warning>
        </Box>
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
      </SectionField>
    );
  }

  return null;
};

export default SlugInput;
