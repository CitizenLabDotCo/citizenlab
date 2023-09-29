import React from 'react';
import { Section, SectionTitle } from 'components/admin/Section';
import ActionsForm from '../../../admin/containers/Granular/ActionsForm';
import GetGlobalPermissions, {
  GetGlobalPermissionsChildProps,
} from 'resources/GetGlobalPermissions';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import { HandlePermissionChangeProps } from '../Granular/utils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useUpdatePermission from 'api/permissions/useUpdatePermission';

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
