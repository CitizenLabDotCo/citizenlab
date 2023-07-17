import React from 'react';

import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

const RequireApprovalToggle = ({ value, onChange }: Props) => {
  const initiativeApprovalEnabled = useFeatureFlag({
    name: 'initiative_approval',
  });
  if (!initiativeApprovalEnabled) return null;

  return (
    <SectionField>
      <Toggle
        checked={value}
        onChange={() => {
          onChange(!value);
        }}
        label={
          // copied from front/app/components/admin/AnonymousPostingToggle/AnonymousPostingToggle.tsx
          <Box ml="8px">
            <Box display="flex">
              <Text
                color="primary"
                mb="0px"
                fontSize="m"
                style={{ fontWeight: 600 }}
              >
                <FormattedMessage {...messages.requireApprovalLabel} />
              </Text>
            </Box>

            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.requireApprovalInfo} />
            </Text>
          </Box>
        }
      />
    </SectionField>
  );
};

export default RequireApprovalToggle;
