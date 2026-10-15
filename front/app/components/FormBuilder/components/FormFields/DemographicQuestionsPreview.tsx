import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

// Read-only list of the demographic questions under the user page. They are
// not form fields, so they can't be dragged or edited here.
const DemographicQuestionsPreview = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { data: permissionFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action: 'posting_idea',
  });

  if (!permissionFields) return null;

  const fields = permissionFields.data;

  return (
    <Box px="40px" py="12px" bgColor={colors.grey50}>
      {fields.length === 0 ? (
        <Text m="0" fontSize="s" color="textSecondary" fontStyle="italic">
          {formatMessage(messages.noDemographicQuestionsYet)}
        </Text>
      ) : (
        fields.map((field) => (
          <Box
            key={field.id}
            display="flex"
            alignItems="center"
            py="8px"
            borderBottom={`1px solid ${colors.divider}`}
          >
            <Icon name="user-data" width="16px" fill={colors.coolGrey500} />
            <Text as="span" m="0" ml="8px" color="grey800">
              <T value={field.attributes.title_multiloc} />
            </Text>
          </Box>
        ))
      )}
    </Box>
  );
};

export default DemographicQuestionsPreview;
