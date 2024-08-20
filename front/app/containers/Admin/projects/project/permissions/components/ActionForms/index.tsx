import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useResetPhasePermission from 'api/phase_permissions/useResetPhasePermission';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';
import usePhase from 'api/phases/usePhase';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getPermissionActionSectionSubtitle } from './utils';

type Props = {
  phaseId: string;
};

const ActionForms = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();
  const { mutate: resetPhasePermission } = useResetPhasePermission();

  if (!permissions || !phase) return null;

  const postType =
    phase.data.attributes.participation_method === 'native_survey'
      ? 'nativeSurvey'
      : 'defaultInput';

  if (permissions.data.length === 0) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  }

  return (
    <>
      {permissions.data.map((permission, index) => {
        const permissionAction = permission.attributes.action;
        const last = index === permissions.data.length - 1;

        return (
          <Box
            key={permission.id}
            mb={last ? '0px' : '60px'}
            className={`e2e-action-form-${permissionAction}`}
          >
            <Title variant="h3" color="primary">
              <FormattedMessage
                {...getPermissionActionSectionSubtitle({
                  permissionAction,
                  postType,
                })}
              />
            </Title>
            <ActionForm
              phaseId={phaseId}
              permissionData={permission}
              groupIds={permission.relationships.groups.data.map((p) => p.id)}
              onChange={({ permittedBy, groupIds, verificationExpiry }) =>
                updatePhasePermission({
                  permissionId: permission.id,
                  phaseId,
                  action: permissionAction,
                  permission: {
                    permitted_by: permittedBy,
                    group_ids: groupIds,
                    verification_expiry: verificationExpiry,
                  },
                })
              }
              onReset={() =>
                resetPhasePermission({
                  permissionId: permission.id,
                  phaseId,
                  action: permission.attributes.action,
                })
              }
            />
          </Box>
        );
      })}
    </>
  );
};

export default ActionForms;
