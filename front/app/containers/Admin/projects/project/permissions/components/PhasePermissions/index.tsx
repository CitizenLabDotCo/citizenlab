import React, { useState } from 'react';

import {
  Accordion,
  Box,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import ActionsForm from 'components/admin/ActionsForm';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../../containers/Project/Granular/messages';

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

  const phaseActionsForm = (
    <Box
      display="flex"
      flex={'1'}
      flexDirection="column"
      background={colors.white}
      minHeight="100px"
    >
      <ActionsFormWrapper
        phase={phase}
        onChange={handlePermissionChange}
        projectId={project.id}
      />
    </Box>
  );

  if (isSinglePhase) {
    return phaseActionsForm;
  } else {
    return (
      <Accordion
        timeoutMilliseconds={1000}
        transitionHeightPx={1700}
        isOpenByDefault={false}
        title={
          <Title
            id="e2e-granular-permissions-phase-accordion"
            variant="h3"
            color="primary"
            my="20px"
            style={{ fontWeight: 500 }}
          >
            <>
              <FormattedMessage {...messages.phase} />
              {` ${phaseNumber}: `}
            </>
            <T value={phase.attributes.title_multiloc} />
          </Title>
        }
        key={phase.id}
        onChange={() => {
          setOpenedPhaseId(openedPhaseId === phase.id ? null : phase.id);
        }}
      >
        {phaseActionsForm}
      </Accordion>
    );
  }
};

type ActionsFormWrapperProps = {
  phase: IPhaseData;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
  projectId: string;
};

const ActionsFormWrapper = ({
  phase,
  onChange,
  projectId,
}: ActionsFormWrapperProps) => {
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });
  console.log({ permissions });

  if (!permissions) {
    return null;
  }

  const config = getMethodConfig(phase.attributes.participation_method);

  return (
    <Box mb="40px">
      <ActionsForm
        permissions={permissions.data}
        onChange={onChange}
        postType={config.postType}
        projectId={projectId}
        phaseId={phase.id}
      />
    </Box>
  );
};

export default PhasePermissions;
