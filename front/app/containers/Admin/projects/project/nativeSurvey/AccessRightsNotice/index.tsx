import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocalize from 'hooks/useLocalize';

import CloseIconButton from 'components/UI/CloseIconButton';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

// hooks

// intl
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

  // NOTE: There should only ever one permission for a survey phase
  const permittedBySetting = permissions?.data[0].attributes.permitted_by;
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

  return (
    <Box id="e2e-warning-notice" mb="20px">
      <Warning>
        <Box display="flex">
          <Box>
            {permittedBySetting === 'everyone' ? (
              <>
                <p>{formatMessage(messages.anyoneIntro)}</p>
                <ul>
                  <li>{formatMessage(messages.anyoneBullet1)}</li>
                  <li>{formatMessage(messages.anyoneBullet2)}</li>
                </ul>
                <p>
                  <FormattedMessage
                    {...messages.anyoneOutro}
                    values={{
                      accessRightsSettingsLink,
                    }}
                  />
                </p>
              </>
            ) : (
              <>
                {surveyUserFields && (
                  <>
                    {/* TODO: Fix this the next time the file is edited. */}
                    {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                    {surveyUserFields?.length > 0 && (
                      <>
                        <p>{formatMessage(messages.userFieldsIntro)}</p>
                        <ul>
                          <li>{surveyUserFields.join(', ')}</li>
                        </ul>
                      </>
                    )}
                    <p>
                      <FormattedMessage
                        {...messages.userFieldsOutro}
                        values={{
                          accessRightsSettingsLink,
                        }}
                      />
                    </p>
                  </>
                )}
              </>
            )}
          </Box>
          <CloseIconButton onClick={handleClose} />
        </Box>
      </Warning>
    </Box>
  );
};

export default AccessRightsNotice;
