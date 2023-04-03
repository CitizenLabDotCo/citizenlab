import React, { memo } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

// services
import {
  IGlobalPermissionAction,
  IPermissionData,
} from 'services/actionPermissions';

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
  getPermissionActionMessage,
  getPermissionActionSectionSubtitle,
} from './utils';
import { IPCAction } from 'typings';

const ActionPermissionWrapper = styled.div`
  margin-bottom: 30px;
  margin-left: 20px;

  &.last {
    margin-bottom: 0;
  }
`;

const StyledTitle = styled(Title)`
  display: flex;
  align-items: center;

  ::after {
    content: '';
    flex: 1;
    margin-left: 1rem;
    height: 1px;
    background-color: ${colors.grey400};
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
  onChange: (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => void;
};

const showDivider = (
  action: IPCAction | IGlobalPermissionAction,
  postType: 'defaultInput' | 'nativeSurvey' | 'initiative'
) => {
  if (postType === 'nativeSurvey') return false;

  switch (action) {
    case 'taking_poll':
    case 'taking_survey':
      return false;
    default:
      return true;
  }
};

type Props = PostTypeProps & SharedProps;

const ActionsForm = memo(
  ({ permissions, postType, onChange, projectId, phaseId }: Props) => {
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
        onChange(permission, permittedBy, groupIds);
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
                {showDivider(permissionAction, postType) && (
                  <StyledTitle
                    className="title-with-line"
                    variant="h5"
                    color="coolGrey600"
                  >
                    <FormattedMessage
                      {...getPermissionActionMessage({
                        permissionAction,
                        project,
                        phases,
                        postType,
                      })}
                    />
                  </StyledTitle>
                )}

                <Title variant="h4" color="primary">
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
                  includePermissionsCustomFields && (
                    <Box mt="42px" mb="20px">
                      <UserFieldSelection
                        permission={permission}
                        projectId={projectId}
                        phaseId={phaseId}
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
