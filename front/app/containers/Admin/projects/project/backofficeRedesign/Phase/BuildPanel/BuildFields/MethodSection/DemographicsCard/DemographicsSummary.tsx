import React from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import demographicMessages from 'components/admin/ActionForm/DataSection/DemographicSection/messages';
import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './DemographicsCard.module.css';

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
    <span className={styles.summary}>
      {nQuestions > 0
        ? formatMessage(actionFormMessages.nQuestions, { nQuestions })
        : formatMessage(demographicMessages.noDemographicQuestionsAsked)}
    </span>
  );
};

export default DemographicsSummary;
