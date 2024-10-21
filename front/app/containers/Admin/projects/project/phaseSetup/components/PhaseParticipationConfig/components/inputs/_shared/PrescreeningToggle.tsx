import React from 'react';

import { Box, Toggle, Tooltip, Text } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';

interface Props {
  prescreening_enabled: boolean | null | undefined;
  togglePrescreeningEnabled: (prescreening_enabled: boolean) => void;
}

const PrescreeningToggle = ({
  prescreening_enabled,
  togglePrescreeningEnabled,
}: Props) => {
  const prescreeningEnabled = useFeatureFlag({ name: 'prescreening' });

  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.participationOptions} />
      </SubSectionTitle>
      <Tooltip
        disabled={prescreeningEnabled}
        content={<FormattedMessage {...messages.prescreeningTooltip} />}
      >
        <Box>
          <Toggle
            disabled={!prescreeningEnabled}
            checked={prescreening_enabled || false}
            onChange={() => {
              togglePrescreeningEnabled(!prescreening_enabled);
            }}
            label={
              <Box ml="8px" id="e2e-participation-options-toggle">
                <Box display="flex">
                  <Text
                    color="primary"
                    mb="0px"
                    fontSize="m"
                    style={{ fontWeight: 600 }}
                  >
                    <FormattedMessage {...messages.prescreeningText} />
                  </Text>
                </Box>

                <Text color="coolGrey600" mt="0px" fontSize="m">
                  <FormattedMessage {...messages.prescreeningSubtext} />
                </Text>
              </Box>
            }
          />
        </Box>
      </Tooltip>
    </SectionField>
  );
};

export default PrescreeningToggle;
