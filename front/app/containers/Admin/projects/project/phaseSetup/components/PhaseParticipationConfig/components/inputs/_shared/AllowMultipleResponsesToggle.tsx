import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../../../messages';

type Props = {
  checked: boolean;
  onChange: () => void;
  apiErrors: CLErrors | null | undefined;
};

// The allow_multiple_responses setting, shown for every participation method
// that supports it (native survey, ideation, proposals) right below the
// method selector.
const AllowMultipleResponsesToggle = ({
  checked,
  onChange,
  apiErrors,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SectionField>
      <Toggle
        checked={checked}
        onChange={onChange}
        label={
          <Box>
            <Text fontWeight="semi-bold" color="blue500" m="0px">
              {formatMessage(messages.allowMultipleResponsesLabel)}
            </Text>
            <Text m="0px" color="coolGrey600" fontSize="s">
              {formatMessage(messages.allowMultipleResponsesDescription)}
            </Text>
          </Box>
        }
      />
      <Error apiErrors={apiErrors && apiErrors.allow_multiple_responses} />
    </SectionField>
  );
};

export default AllowMultipleResponsesToggle;
