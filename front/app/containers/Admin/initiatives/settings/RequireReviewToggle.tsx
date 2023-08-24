import React from 'react';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import {
  Box,
  Toggle,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

const RequireReviewToggle = ({ value, onChange }: Props) => {
  const initiativeReviewEnabled = useFeatureFlag({
    name: 'initiative_review',
  });
  if (!initiativeReviewEnabled) return null;

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.review} />
      </SubSectionTitle>
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
                <FormattedMessage {...messages.requireReviewLabel} />
              </Text>
              <Box ml="4px" mt="16px">
                <IconTooltip
                  placement="top-start"
                  content={
                    <FormattedMessage {...messages.requireReviewTooltip} />
                  }
                />
              </Box>
            </Box>

            <Text color="coolGrey600" mt="0px" fontSize="m">
              <FormattedMessage {...messages.requireReviewInfo} />
            </Text>
          </Box>
        }
      />
    </SectionField>
  );
};

export default RequireReviewToggle;
