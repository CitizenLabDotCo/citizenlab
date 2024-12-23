import React from 'react';

import { Box, Toggle, Tooltip, Text } from '@citizenlab/cl2-component-library';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../../../messages';

interface Props {
  prescreening_enabled: boolean | null | undefined;
  togglePrescreeningEnabled: (prescreening_enabled: boolean) => void;
  prescreeningFeatureAllowed: boolean;
}

const PrescreeningToggle = ({
  prescreening_enabled,
  togglePrescreeningEnabled,
  prescreeningFeatureAllowed,
}: Props) => {
  return (
    <SectionField>
      <SubSectionTitle style={{ marginBottom: '0px' }}>
        <FormattedMessage {...messages.participationOptions} />
      </SubSectionTitle>
      <Tooltip
        disabled={prescreeningFeatureAllowed}
        content={<FormattedMessage {...messages.prescreeningTooltip} />}
      >
        <Box>
          <Toggle
            disabled={!prescreeningFeatureAllowed}
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
                    fontWeight="semi-bold"
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
