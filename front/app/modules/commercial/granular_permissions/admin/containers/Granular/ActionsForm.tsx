import React, { memo } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

// services
import { IPermissionData } from 'services/actionPermissions';

// components
import ActionForm from './ActionForm';
import UserFieldSelection from '../../components/UserFieldSelection/UserFieldSelection';
import { Box, colors, Title } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useFeatureFlag from 'hooks/useFeatureFlag';

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

const ActionsForm = memo(
  ({
    permissions,
    postType,
    onChange,
    projectId,
    initiativeContext,
    phaseId,
  }: Props) => {
    const includePermissionsCustomFields = useFeatureFlag({
      name: 'permissions_custom_fields',
    });
    const project = useProject({ projectId });
    const phases = usePhases(projectId);

    const handlePermissionChange =
      (permission: IPermissionData) =>
      (
        permittedBy: IPermissionData['attributes']['permitted_by'],
        groupIds: string[]
      ) => {
        onChange({ permission, permittedBy, groupIds });
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
                      project,
                      phases,
                      postType,
                    })}
                  />
                </Title>
                <ActionForm
                  permissionData={permission}
                  groupIds={permission.relationships.groups.data.map(
                    (p) => p.id
                  )}
                  projectType={postType}
                  onChange={handlePermissionChange(permission)}
                />
                {permission.attributes.permitted_by !== 'everyone' &&
                  permission.attributes.permitted_by !== 'admins_moderators' &&
                  includePermissionsCustomFields && (
                    <Box
                      mt="10px"
                      border={`solid 1px ${colors.grey300}`}
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
  }
);

export default ActionsForm;
