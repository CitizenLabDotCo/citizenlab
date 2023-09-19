import React, { useState } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

// services
import { IPermissionData } from 'api/permissions/types';

// components
import ActionForm from './ActionForm';
import UserFieldSelection from '../../components/UserFieldSelection/UserFieldSelection';
import { Box, colors, Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import {
  getPermissionActionSectionSubtitle,
  HandlePermissionChangeProps,
} from './utils';

const ActionPermissionWrapper = styled.div`
  margin-left: 0px;
  margin-bottom: 20px;

  &.last {
    margin-bottom: 0;
  }
`;

type PostTypeProps =
  | {
      postType: 'defaultInput';
      projectId: string;
    }
  | {
      postType: 'nativeSurvey';
      projectId: string;
    }
  | {
      postType: 'initiative';
      projectId: null;
    };

type SharedProps = {
  permissions: IPermissionData[];
  phaseId?: string | null;
  initiativeContext?: boolean;
  onChange: ({
    permission,
    permittedBy,
    groupIds,
    globalCustomFields,
  }: HandlePermissionChangeProps) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsForm = ({
  permissions,
  postType,
  onChange,
  projectId,
  initiativeContext,
  phaseId,
}: Props) => {
  const [previousUsersGlobalCustomFields, setPreviousUsersGlobalCustomFields] =
    useState(true);
  const [
    previousGroupsGlobalCustomFields,
    setPreviousGroupsGlobalCustomFields,
  ] = useState(true);

  const handlePermissionChange =
    (permission: IPermissionData, phaseId?: string | null) =>
    (
      permittedBy: IPermissionData['attributes']['permitted_by'],
      groupIds: string[]
    ) => {
      // Remember what the last values of global custom fields toggles were for 'users' & 'groups'
      const previousPermittedBy = permission.attributes.permitted_by;
      if (previousPermittedBy === 'users') {
        setPreviousUsersGlobalCustomFields(
          permission.attributes.global_custom_fields
        );
      } else if (previousPermittedBy === 'groups') {
        setPreviousGroupsGlobalCustomFields(
          permission.attributes.global_custom_fields
        );
      }

      // Set global custom fields toggle back to the old value when switching back to 'users' & 'groups'
      let globalCustomFields = false;
      if (permittedBy === 'users') {
        globalCustomFields = previousUsersGlobalCustomFields;
      } else if (permittedBy === 'groups') {
        globalCustomFields = previousGroupsGlobalCustomFields;
      }

      onChange({
        permission,
        permittedBy,
        groupIds,
        globalCustomFields,
        phaseId,
      });
    };

  if (isEmpty(permissions)) {
    return (
      <p>
        <FormattedMessage {...messages.noActionsCanBeTakenInThisProject} />
      </p>
    );
  } else {
    return (
      <>
        {permissions.map((permission, index) => {
          const permissionAction = permission.attributes.action;
          return (
            <ActionPermissionWrapper
              key={permission.id}
              className={`${index === 0 ? 'first' : ''} ${
                index === permissions.length - 1 ? 'last' : ''
              }`}
            >
              <Title variant="h3" color="primary">
                <FormattedMessage
                  {...getPermissionActionSectionSubtitle({
                    permissionAction,
                    postType,
                  })}
                />
              </Title>
              <ActionForm
                permissionData={permission}
                groupIds={permission.relationships.groups.data.map((p) => p.id)}
                projectType={postType}
                onChange={handlePermissionChange(permission, phaseId)}
              />
              {permission.attributes.permitted_by !== 'everyone' &&
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
                      initiativeContext={initiativeContext}
                      onChange={onChange}
                    />
                  </Box>
                )}
            </ActionPermissionWrapper>
          );
        })}
      </>
    );
  }
};

export default ActionsForm;
