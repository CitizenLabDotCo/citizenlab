import React from 'react';
import Input from 'components/HookForm/Input';
import { SectionField } from 'components/admin/Section';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import {
  Label,
  Box,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

interface Props {
  slug?: string;
  pathnameWithoutSlug: string;
}

const SlugInput = ({ slug, pathnameWithoutSlug }: Props) => {
  const appConfig = useAppConfiguration();
  const locale = useLocale();

  if (!isNilOrError(appConfig)) {
    const hostName = appConfig.data.attributes.host;
    const previewUrl = slug
      ? `${hostName}/${locale}/${pathnameWithoutSlug}/${slug}`
      : null;
    return (
      <SectionField>
        <Box display="flex" alignItems="center">
          <Label htmlFor="slug">
            <FormattedMessage {...messages.pageUrl} />
          </Label>
          {/*
            Adding this margin-bottom is bad, label shouldn't have default margin-bottom.
            Or ideally have a tooltip prop.
          */}
          <Box mb="14px">
            <IconTooltip
              content={<FormattedMessage {...messages.slugTooltip} />}
            />
          </Box>
        </Box>
        <Box mb="16px">
          <Warning>
            <FormattedMessage {...messages.brokenURLWarning} />
          </Warning>
        </Box>
        <Input id="slug" name="slug" type="text" />
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
