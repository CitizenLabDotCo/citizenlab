import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { Changes } from '../types';

import AdminCollaboratorToggle from './AdminCollaboratorToggle';
import CardButtons from './CardButtons';
import CustomizeErrorMessage from './CustomizeErrorMessage';
import GroupSelect from './GroupSelect';

interface Props {
  showAnyone?: 'show' | 'show-with-new-label';
  permissionData: IPermissionData;
  onChange: (changes: Changes) => void;
}

const AccessRestrictions = ({
  showAnyone,
  permissionData,
  onChange,
}: Props) => {
  const {
    relationships,
    attributes: { permitted_by },
  } = permissionData;
  const groupIds = relationships.groups.data.map((p) => p.id);

  return (
    <>
      <AdminCollaboratorToggle
        checked={permitted_by === 'admins_moderators'}
        id={`participation-permission-admins-${permissionData.id}`}
        onChange={() => {
          onChange({
            permitted_by:
              permitted_by === 'admins_moderators'
                ? 'users'
                : 'admins_moderators',
          });
        }}
      />
      {permitted_by !== 'admins_moderators' && (
        <>
          <Box my="20px">
            <Title variant="h4" m="0" color="primary">
              <FormattedMessage {...messages.authentication} />
            </Title>
          </Box>
          <Box display="flex" gap="16px">
            <CardButtons
              showAnyone={showAnyone}
              permittedBy={permitted_by}
              onUpdate={(permitted_by) => {
                onChange({ permitted_by });
              }}
            />
          </Box>
          {permitted_by !== 'everyone' && (
            <>
              <Box mt="28px">
                <Title variant="h4" color="primary">
                  <FormattedMessage {...messages.restrictParticipation} />
                </Title>
                {/* For some reason this tooltip doesn't work properly unless I put it in
                 * a Box of exactly the same size as the child component
                 */}
                <Box w="300px">
                  <GroupSelect
                    groupIds={groupIds}
                    onChange={(group_ids) => {
                      onChange({ group_ids });
                    }}
                  />
                </Box>
              </Box>
              <CustomizeErrorMessage
                access_denied_explanation_multiloc={
                  permissionData.attributes.access_denied_explanation_multiloc
                }
                onUpdate={async (access_denied_explanation_multiloc) => {
                  await onChange({ access_denied_explanation_multiloc });
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default AccessRestrictions;
