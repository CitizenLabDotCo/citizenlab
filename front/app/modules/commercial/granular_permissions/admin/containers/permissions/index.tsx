import React, { memo } from 'react';
import GetGlobalPermissions, {
  GetGlobalPermissionsChildProps,
} from 'resources/GetGlobalPermissions';
import { updateGlobalPermission } from 'services/actionPermissions';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import ActionsForm from '../../../admin/containers/Granular/ActionsForm';
import FeatureFlag from 'components/FeatureFlag';
import { Section, SectionTitle } from 'components/admin/Section';
import messages from './messages';

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
