import React, { useState } from 'react';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import {
  Accordion,
  Box,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
import { PhaseActionForm } from '../../components/PhaseActionForm';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { HandlePermissionChangeProps } from './utils';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  phaseNumber?: number;
}

const PhasePermissions = ({ project, phase, phaseNumber }: Props) => {
  const [openedPhaseId, setOpenedPhaseId] = useState<string | null>(null);
  const { mutate: updatePhasePermission } =
    useUpdatePhasePermission(openedPhaseId);

  const handlePermissionChange = ({
    phaseId,
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    if (phaseId) {
      updatePhasePermission({
        permissionId: permission.id,
        phaseId,
        action: permission.attributes.action,
        permission: {
          permitted_by: permittedBy,
          group_ids: groupIds,
          global_custom_fields: globalCustomFields,
        },
      });
    }
  };

  const isSinglePhase = !phaseNumber;

  return (
    <Accordion
      timeoutMilliseconds={1000}
      transitionHeightPx={1700}
      isOpenByDefault={isSinglePhase}
      title={
        <Title
          id="e2e-granular-permissions-phase-accordion"
          variant="h3"
          color="primary"
          my="20px"
          style={{ fontWeight: 500 }}
        >
          {!isSinglePhase && (
            <>
              <FormattedMessage {...messages.phase} />
              {` ${phaseNumber}: `}
            </>
          )}
          <T value={phase.attributes.title_multiloc} />
        </Title>
      }
      key={phase.id}
      onChange={() => {
        setOpenedPhaseId(openedPhaseId === phase.id ? null : phase.id);
      }}
    >
      <Box
        display="flex"
        flex={'1'}
        flexDirection="column"
        background={colors.white}
        minHeight="100px"
      >
        <PhaseActionForm
          phase={phase}
          onChange={handlePermissionChange}
          projectId={project.id}
        />
      </Box>
    </Accordion>
  );
};

export default PhasePermissions;
