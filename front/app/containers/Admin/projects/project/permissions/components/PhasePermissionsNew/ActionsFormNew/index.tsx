import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';

import messages from 'components/admin/ActionsForm/messages';
import { HandlePermissionChangeProps } from 'components/admin/ActionsForm/typings';
import { getPermissionActionSectionSubtitle } from 'components/admin/ActionsForm/utils';

import { FormattedMessage } from 'utils/cl-intl';

import ActionFormNew from './ActionFormNew';

type PostTypeProps =
  | {
      postType: 'defaultInput';
      projectId: string;
    }
  | {
      postType: 'nativeSurvey';
      projectId: string;
    };

type SharedProps = {
  permissions: IPermissionData[];
  phaseId?: string | null;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsFormNew = ({
  permissions,
  postType,
  onChange,
  // projectId,
  phaseId,
}: Props) => {
  const handlePermissionChange =
    (permission: IPermissionData, phaseId?: string | null) => () => {
      console.log({ phaseId });

      onChange({
        permission,
        permittedBy: 'groups', // TODO
        groupIds: [], // TODO
        globalCustomFields: false, // TODO
      });
    };

  if (permissions.length === 0) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  }

  return (
    <>
      {permissions.map((permission, index) => {
        const permissionAction = permission.attributes.action;
        const last = index === permissions.length - 1;

        return (
          <Box key={permission.id} mb={last ? '0px' : '20px'}>
            <Title variant="h3" color="primary">
              <FormattedMessage
                {...getPermissionActionSectionSubtitle({
                  permissionAction,
                  postType,
                })}
              />
            </Title>
            <ActionFormNew
              permissionData={permission}
              groupIds={permission.relationships.groups.data.map((p) => p.id)}
              phaseType={postType}
              onChange={handlePermissionChange(permission, phaseId)}
            />
            {/* {permission.attributes.permitted_by !== 'everyone' &&
              permission.attributes.permitted_by !== 'admins_moderators' && (
                <Box
                  pt="10px"
                  borderLeft={`solid 1px ${colors.grey300}`}
                  px="20px"
                  pb="20px"
                >
                  <UserFieldSelection
                    permission={permission}
                    projectId={projectId}
                    phaseId={phaseId}
                    initiativeContext={postType === 'initiative'}
                    onChange={onChange}
                  />
                </Box>
              )} */}
          </Box>
        );
      })}
    </>
  );
};

export default ActionsFormNew;
