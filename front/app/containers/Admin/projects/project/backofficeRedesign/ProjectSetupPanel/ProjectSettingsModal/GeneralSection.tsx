import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import SlugInput from 'components/admin/SlugInput';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  slug: string;
  currentSlug: string;
  showSlugErrorMessage: boolean;
  apiErrors: CLErrors;
  onSlugChange: (slug: string) => void;
}

const GeneralSection = ({
  slug,
  currentSlug,
  showSlugErrorMessage,
  apiErrors,
  onSlugChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Text variant="boSection" mt="0px" mb="12px">
        {formatMessage(messages.settingsUrlSlug)}
      </Text>
      <SlugInput
        slug={slug}
        pathnameWithoutSlug="projects"
        apiErrors={apiErrors}
        showSlugErrorMessage={showSlugErrorMessage}
        onSlugChange={onSlugChange}
        showSlugChangedWarning={slug !== currentSlug}
      />
    </Box>
  );
};

export default GeneralSection;
