import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IGlobalPermissionData } from 'api/permissions/types';
import useResetPermission from 'api/permissions/useResetPermission';
import useUpdatePermission from 'api/permissions/useUpdatePermission';

import { getPermissionActionSectionSubtitle } from 'containers/Admin/projects/project/permissions/components/ActionForms/utils';

import ActionForm from 'components/admin/ActionForm';

import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  permissions: IGlobalPermissionData[];
}

const ActionForms = ({ permissions }: Props) => {
  const { mutate: updatePermission } = useUpdatePermission();
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
                  postType: 'initiative',
                })}
              />
            </Title>
            <ActionForm
              permissionData={permission}
              groupIds={permission.relationships.groups.data.map((p) => p.id)}
              onChange={(permittedBy, groupIds) =>
                updatePermission({
                  id: permission.id,
                  action: permission.attributes.action,
                  permitted_by: permittedBy,
                  group_ids: groupIds,
                })
              }
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
