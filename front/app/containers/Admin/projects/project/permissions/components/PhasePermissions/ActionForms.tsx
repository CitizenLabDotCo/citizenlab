import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData, PermittedBy } from 'api/phase_permissions/types';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { HandlePermissionChangeProps } from './typings';
import { getPermissionActionSectionSubtitle } from './utils';

type Props = {
  postType: 'defaultInput' | 'nativeSurvey';
  projectId: string;
  permissions: IPhasePermissionData[];
  phaseId?: string | null;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
};

const ActionForms = ({ permissions, postType, onChange, phaseId }: Props) => {
  const handlePermissionChange =
    (permission: IPhasePermissionData) =>
    (permittedBy: PermittedBy, groupIds: string[]) => {
      onChange({
        permission,
        permittedBy,
        groupIds,
      });
    };

  if (permissions.length === 0) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  }

  if (!phaseId) return null;

  return (
    <>
      {permissions.map((permission, index) => {
        const permissionAction = permission.attributes.action;
        const last = index === permissions.length - 1;

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
              onChange={handlePermissionChange(permission)}
            />
          </Box>
        );
      })}
    </>
  );
};

export default ActionForms;
