import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

type AccessRightsNoticeProps = {
  projectId: string;
  phaseId: string;
  handleClose: () => void;
};

const AccessRightsNotice = ({
  projectId,
  phaseId,
  handleClose,
}: AccessRightsNoticeProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { data: userCustomFields } = useUserCustomFields();
  const { data: permissionCustomFields } = usePermissionsCustomFields({
    phaseId,
    action: 'posting_idea',
  });

  const postingPermission = permissions?.data.find((permission) => {
    return permission.attributes.action === 'posting_idea';
  });

  const permittedBySetting = postingPermission?.attributes.permitted_by;
  const userFieldsInForm = postingPermission?.attributes.user_fields_in_form;

  const globalCustomFieldsSetting =
    permissions?.data[0].attributes.global_custom_fields;

  const permissionCustomFieldIds = permissionCustomFields?.data.map(
    (customField) => customField.relationships.custom_field.data.id
  );

  const surveyUserFields: Array<string | null> | undefined =
    userCustomFields?.data
      .filter((customField) => {
        if (
          !globalCustomFieldsSetting ||
          permittedBySetting === 'everyone_confirmed_email'
        ) {
          return permissionCustomFieldIds?.includes(customField.id);
        }
        return customField.attributes.enabled;
      })
      .map((customField) => {
        return localize(customField.attributes.title_multiloc);
      });

  const accessRightsSettingsLink = (
    <Link to={`/admin/projects/${projectId}/phases/${phaseId}/access-rights`}>
      {formatMessage(messages.accessRightsSettings)}
    </Link>
  );

  if (userFieldsInForm && permittedBySetting !== 'everyone') return null;

  return (
    <Box id="e2e-warning-notice" mb="16px">
      <Box
        w="100%"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.teal100}
        p="12px"
      >
        <Box display="flex" alignItems="center">
          <Icon name="info-outline" height="24px" fill={colors.teal700} />
          <Text m="0" ml="12px" color="teal700">
            {surveyUserFields?.join(' ')}
            {accessRightsSettingsLink}
          </Text>
        </Box>
        <CloseIconButton onClick={handleClose} />
      </Box>
    </Box>
  );
};

export default AccessRightsNotice;
