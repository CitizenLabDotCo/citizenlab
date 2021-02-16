import React, { memo } from 'react';
import { Section, SectionTitle } from 'components/admin/Section';
import ActionsForm from 'modules/granular_permissions/admin/containers/Granular/ActionsForm';
import GetGlobalPermissions, {
  GetGlobalPermissionsChildProps,
} from 'resources/GetGlobalPermissions';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { isNilOrError } from 'utils/helperUtils';
import { updateGlobalPermission } from 'services/actionPermissions';
import FeatureFlag from 'components/FeatureFlag';

interface DataProps {
  permissions: GetGlobalPermissionsChildProps;
}

const PermissionsInitiatives = memo<DataProps>(({ permissions }) => {
  const handlePermissionChange = (permission, permittedBy, groupIds) => {
    updateGlobalPermission(permission.id, permission.attributes.action, {
      permitted_by: permittedBy,
      group_ids: groupIds,
    });
  };
  return (
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
          />
        )}
      </FeatureFlag>
    </Section>
  );
});

export default (inputProps) => (
  <GetGlobalPermissions>
    {(permissions) => (
      <PermissionsInitiatives {...inputProps} permissions={permissions} />
    )}
  </GetGlobalPermissions>
);
