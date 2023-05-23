import React, { memo } from 'react';
import { Section, SectionTitle } from 'components/admin/Section';
import ActionsForm from '../../../admin/containers/Granular/ActionsForm';
import GetGlobalPermissions, {
  GetGlobalPermissionsChildProps,
} from 'resources/GetGlobalPermissions';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import { updateGlobalPermission } from 'services/actionPermissions';
import FeatureFlag from 'components/FeatureFlag';
import { Box, Title } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import { HandlePermissionChangeProps } from '../Granular/utils';

interface DataProps {
  permissions: GetGlobalPermissionsChildProps;
}

const PermissionsInitiatives = memo<DataProps>(({ permissions }) => {
  const handlePermissionChange = ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => {
    updateGlobalPermission(permission.id, permission.attributes.action, {
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
          <FeatureFlag name="granular_permissions">
            <SectionTitle>
              <FormattedMessage {...messages.granularPermissionsTitle} />
            </SectionTitle>
            {!isNilOrError(permissions) && (
              <ActionsForm
                permissions={permissions}
                onChange={handlePermissionChange}
                postType="initiative"
                projectId={null}
                initiativeContext
              />
            )}
          </FeatureFlag>
        </Section>
      </Box>
    </>
  );
});

export default (inputProps) => (
  <GetGlobalPermissions>
    {(permissions) => (
      <PermissionsInitiatives {...inputProps} permissions={permissions} />
    )}
  </GetGlobalPermissions>
);
