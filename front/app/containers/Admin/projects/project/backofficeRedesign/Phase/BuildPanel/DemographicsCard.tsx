import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';
import { isPhasePermissionAction } from 'api/permissions/utils';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import DemographicsModal from './DemographicsModal';
import DemographicsSummary from './DemographicsSummary';
import PanelField from './PanelField';

const ACTION_ORDER: IPhasePermissionAction[] = [
  'posting_idea',
  'taking_survey',
  'taking_poll',
  'voting',
  'volunteering',
  'annotating_document',
  'commenting_idea',
  'reacting_idea',
  'attending_event',
];

interface Props {
  phaseId: string;
}

/** Which demographic questions participants answer, per action. */
const DemographicsCard = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const actions = (permissions?.data ?? [])
    .map(({ attributes }) => attributes.action)
    .filter(isPhasePermissionAction)
    .sort((a, b) => ACTION_ORDER.indexOf(a) - ACTION_ORDER.indexOf(b));

  if (actions.length === 0) return null;

  const label = formatMessage(messages.collectDemographicData);

  return (
    <>
      <PanelField
        label={label}
        action={
          <Box display="flex" alignItems="center" gap="4px">
            {/* The summary follows the phase's main action, sorted first. */}
            <DemographicsSummary phaseId={phaseId} action={actions[0]} />
            <Button
              buttonStyle="bo-text"
              icon="chevron-right"
              iconSize="16px"
              width="28px"
              height="28px"
              padding="0"
              ariaLabel={label}
              onClick={() => setOpened(true)}
            />
          </Box>
        }
      />
      <DemographicsModal
        phaseId={phaseId}
        actions={actions}
        opened={opened}
        onClose={() => setOpened(false)}
      />
    </>
  );
};

export default DemographicsCard;
