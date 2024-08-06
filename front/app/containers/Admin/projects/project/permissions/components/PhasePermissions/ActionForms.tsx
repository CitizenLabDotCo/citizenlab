import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useResetPhasePermission from 'api/phase_permissions/useResetPhasePermission';
import useUpdatePhasePermission from 'api/phase_permissions/useUpdatePhasePermission';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { getPermissionActionSectionSubtitle } from './utils';

type Props = {
  postType: 'defaultInput' | 'nativeSurvey';
  phaseId: string;
};

const ActionForms = ({ postType, phaseId }: Props) => {
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { mutate: updatePhasePermission } = useUpdatePhasePermission();
  const { mutate: resetPhasePermission } = useResetPhasePermission();

  if (!permissions) return null;

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
          <Box key={permission.id} mb={last ? '0px' : '60px'}>
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
              phaseType={postType}
              onChange={(permittedBy, groupIds) =>
                updatePhasePermission({
                  permissionId: permission.id,
                  phaseId,
                  action: permissionAction,
                  permission: {
                    permitted_by: permittedBy,
                    group_ids: groupIds,
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
