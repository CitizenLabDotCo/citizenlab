import React from 'react';

import ReviewStatus from 'design-system/ReviewStatus';
import Text from 'design-system/Text';

import { IPhasePermissionAction } from 'api/permissions/types';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import actionFormMessages from 'components/admin/ActionForm/messages';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  label: string;
  labelTooltip?: JSX.Element;
  onOpen: () => void;
}

const DemographicsSummary = ({
  phaseId,
  action,
  label,
  labelTooltip,
  onOpen,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: customFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });

  const nQuestions = customFields?.data.length;

  return (
    <PanelField
      reviewKey={nQuestions ? 'demographics' : undefined}
      label={label}
      labelTooltip={labelTooltip}
      action={
        nQuestions === 0 ? (
          <ReviewStatus status="toSet" />
        ) : nQuestions ? (
          <Text as="span" variant="small" tone="secondary">
            {formatMessage(actionFormMessages.nQuestions, { nQuestions })}
          </Text>
        ) : undefined
      }
      button={{ icon: 'chevron-right', onClick: onOpen }}
    />
  );
};

export default DemographicsSummary;
