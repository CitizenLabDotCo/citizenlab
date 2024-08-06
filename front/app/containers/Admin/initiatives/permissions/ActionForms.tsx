import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IGlobalPermissionData } from 'api/permissions/types';
import useResetPermission from 'api/permissions/useResetPermission';

import { HandlePermissionChangeProps } from 'containers/Admin/projects/project/permissions/components/PhasePermissions/typings';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  permissions: IGlobalPermissionData[];
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
}

const ActionForms = ({ permissions, onChange }: Props) => {
  const { mutate: resetPermission } = useResetPermission();

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
              permissionData={permission}
              groupIds={permission.relationships.groups.data.map((p) => p.id)}
              phaseType={postType}
              onChange={onChange}
              onReset={() =>
                resetPermission({
                  action: permissionAction,
                  permissionId: permission.id,
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
