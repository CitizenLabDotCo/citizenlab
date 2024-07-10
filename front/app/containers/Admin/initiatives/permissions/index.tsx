import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';

import { IGlobalPermissionData } from 'api/permissions/types';
import usePermissions from 'api/permissions/usePermissions';
import useUpdatePermission from 'api/permissions/useUpdatePermission';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ActionsForm from 'components/admin/ActionsForm';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';
import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const filterPermissions = (permissions: IGlobalPermissionData[]) => {
  const initiativePermissions = permissions.filter((permission) =>
    [
      'posting_initiative',
      'commenting_initiative',
      'reacting_initiative',
    ].includes(permission.attributes.action)
  );

  // TODO remove this later when we actually start using 'visiting' as a permission
  const notVisitingPermissions = initiativePermissions.filter((permission) => {
    return (permission.attributes.action as any) !== 'visiting';
  });

  return notVisitingPermissions;
};

const PermissionsInitiatives = () => {
  const { data: unfilteredPermissions } = usePermissions();
  const { mutate: updateGlobalPermission } = useUpdatePermission();
  const featureEnabled = useFeatureFlag({ name: 'granular_permissions' });

  if (!featureEnabled || !unfilteredPermissions) return null;

  const permissions = filterPermissions(unfilteredPermissions.data);

  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    updateGlobalPermission({
      id: permission.id,
      action: permission.attributes.action,
      permitted_by: permittedBy,
      group_ids: groupIds,
      global_custom_fields: globalCustomFields,
    });
  };

  return (
    <>
      <Title color="primary" mb="30px">
        <FormattedMessage {...messages.permissionsText} />
      </Title>
      <Box background={colors.white} p="40px">
        <Section>
          <SectionTitle>
            <FormattedMessage {...messages.granularPermissionsTitle} />
          </SectionTitle>
          <ActionsForm
            permissions={permissions}
            onChange={handlePermissionChange}
            postType="initiative"
            projectId={null}
          />
        </Section>
      </Box>
    </>
  );
};

export default PermissionsInitiatives;
