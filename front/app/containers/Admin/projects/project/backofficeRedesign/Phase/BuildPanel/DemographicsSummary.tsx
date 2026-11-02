import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

const DemographicsSummary = ({ phaseId, action }: Props) => {
  const { formatMessage } = useIntl();
  const { data: customFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });

  if (!customFields) return null;

  const nQuestions = customFields.data.length;

  return (
    <Text as="span" variant="boHelper" fontSize="xs" m="0">
      {nQuestions > 0
        ? formatMessage(actionFormMessages.nQuestions, { nQuestions })
        : formatMessage(messages.demographicsNotSet)}
    </Text>
  );
};

export default DemographicsSummary;
