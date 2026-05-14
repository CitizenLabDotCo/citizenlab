import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const CustomFieldsSignupHelperText = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  const helperText =
    appConfiguration?.data.attributes.settings.core
      .custom_fields_signup_helper_text;
  const localizedHelperText = localize(helperText);

  if (!helperText || !localizedHelperText || localizedHelperText.length === 0) {
    return null;
  }

  return (
    <Box mb="20px">
      <QuillEditedContent fontSize="base">
        <T value={helperText} supportHtml />
      </QuillEditedContent>
    </Box>
  );
};

export default CustomFieldsSignupHelperText;
