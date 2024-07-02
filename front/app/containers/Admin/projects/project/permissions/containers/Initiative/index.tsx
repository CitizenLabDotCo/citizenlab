import React from 'react';

import { Box, Title, colors } from '@citizenlab/cl2-component-library';
import GetGlobalPermissions, {
  GetGlobalPermissionsChildProps,
} from 'resources/GetGlobalPermissions';

import useUpdatePermission from 'api/permissions/useUpdatePermission';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import ActionsForm from 'components/admin/ActionsForm';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';

import messages from './messages';

interface DataProps {
  permissions: GetGlobalPermissionsChildProps;
}

const PermissionsInitiatives = ({ permissions }: DataProps) => {
  const { mutate: updateGlobalPermission } = useUpdatePermission();
  const featureEnabled = useFeatureFlag({ name: 'granular_permissions' });

  if (!featureEnabled || isNilOrError(permissions)) return null;

  const initiativePermissions = permissions.filter((permission) =>
    [
      'posting_initiative',
      'commenting_initiative',
      'reacting_initiative',
    ].includes(permission.attributes.action)
  );

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
            permissions={initiativePermissions}
            onChange={handlePermissionChange}
            postType="initiative"
            projectId={null}
            initiativeContext
          />
        </Section>
      </Box>
    </>
  );
};

export default () => (
  <GetGlobalPermissions>
    {(permissions) => <PermissionsInitiatives permissions={permissions} />}
  </GetGlobalPermissions>
);
