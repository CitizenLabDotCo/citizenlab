import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { IPermissionData, IPhasePermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';

import messages from 'components/admin/ActionsForm/messages';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';
import { getPermissionActionSectionSubtitle } from 'components/admin/ActionsForm/utils';

import { FormattedMessage } from 'utils/cl-intl';

import ActionFormNew from './ActionFormNew';

type PostTypeProps =
  | {
      postType: 'defaultInput';
      projectId: string;
    }
  | {
      postType: 'nativeSurvey';
      projectId: string;
    };

type SharedProps = {
  permissions: IPhasePermissionData[];
  phaseId?: string | null;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsFormNew = ({
  permissions,
  postType,
  onChange,
  phaseId,
}: Props) => {
  const handlePermissionChange =
    (permission: IPermissionData) =>
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
            <ActionFormNew
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

export default ActionsFormNew;
