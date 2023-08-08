import React from 'react';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

const RequireCosponsorsToggle = ({ value, onChange }: Props) => {
  const initiativeCosponsorsAllowed = useFeatureFlag({
    name: 'initiative_cosponsors',
    onlyCheckAllowed: true,
  });
  if (!initiativeCosponsorsAllowed) return null;

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.cosponsors} />
      </SubSectionTitle>
      <Toggle
        checked={value}
        onChange={() => {
          onChange(!value);
        }}
        label={
          // copied from front/app/containers/Admin/initiatives/settings/RequireApprovalToggle.tsx
          <Box ml="8px">
            <Box display="flex">
              <Text
                color="primary"
                mb="0px"
                fontSize="m"
                style={{ fontWeight: 600 }}
              >
                <FormattedMessage {...messages.requireCosponsorsLabel} />
              </Text>
            </Box>

            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.requireCosponsorsInfo} />
            </Text>
          </Box>
        }
      />
    </SectionField>
  );
};

export default RequireCosponsorsToggle;
