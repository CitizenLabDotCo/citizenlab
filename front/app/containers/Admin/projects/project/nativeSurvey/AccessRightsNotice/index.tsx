import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from "components/UI/Warning";
import Link from "utils/cl-router/Link";
import usePhasePermissions from "api/phase_permissions/usePhasePermissions";
import usePermissionsCustomFields from "api/permissions_custom_fields/usePermissionsCustomFields";
import useUserCustomFields from "api/user_custom_fields/useUserCustomFields";
import useLocalize from "hooks/useLocalize";

type AccessRightsNoticeProps = {
  projectId: string;
  phaseId: string;
};

const AccessRightsNotice = ({
  projectId,
  phaseId,
}: AccessRightsNoticeProps) => {
  const localize = useLocalize();
  const { data: permissions } = usePhasePermissions({ phaseId });
  const { data: userCustomFields } = useUserCustomFields();
  const { data: permissionCustomFields } = usePermissionsCustomFields({
    projectId,
    phaseId,
    initiativeContext: false,
    action: 'posting_idea',
  });

  // NOTE: There should only ever one permission for a survey phase
  const permittedBySetting = permissions?.data[0].attributes.permitted_by;
  const globalCustomFieldsSetting = permissions?.data[0].attributes.global_custom_fields;
  const permissionCustomFieldIds = permissionCustomFields?.data.map((customField) => customField.relationships.custom_field.data.id)
  const accessRightsPath = `/admin/projects/${projectId}/phases/${phaseId}/access-rights`;

  const surveyUserFields: Array<string | null> | undefined = userCustomFields?.data.filter((customField) => {
    if (!globalCustomFieldsSetting || permittedBySetting === 'everyone_confirmed_email') {
      return permissionCustomFieldIds?.includes(customField.id)
    } else {
      return customField.attributes.enabled;
    }
  }).map((customField) => {
    return localize(customField.attributes.title_multiloc);
  });

  return (
    <Box id="e2e-warning-notice" mb="20px">
      <Warning>
        { permittedBySetting === 'everyone' ? (
          <>
            <p>This survey is set to allow access for "Anyone".</p>
            <ul>
              <li>Residents who are not logged in can submit answers twice</li>
              <li>You won't get demographic analysis of answers from residents
                who are not logged in</li>
            </ul>
            <p>If you wish to change this, you can do so in the
              <Link to={accessRightsPath}>access rights for this phase</Link>.</p>
          </>
        ) : (
          <>{ surveyUserFields && surveyUserFields?.length > 0 ? (
            <>
            <p>You are asking the following demographic questions through registration for this survey.
              To ask additional demographic questions we suggest you add these through
              the <Link to={accessRightsPath}>access rights for this phase</Link>.</p>
            <ul>
              { surveyUserFields?.map((fieldName, index) => {
                return (<li key={index}>{fieldName}</li>)
              })}
            </ul>
            </>
            ):(
          <p>You are not asking any demographic questions through registration.
            If you want to ask demographic questions we suggest you add these through
            the <Link to={accessRightsPath}>access rights for this phase</Link>.</p>
            )}</>
        )}
      </Warning>
    </Box>
  );
};

export default AccessRightsNotice;
