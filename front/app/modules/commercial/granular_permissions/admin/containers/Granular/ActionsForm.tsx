import React, { memo } from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';

// services
import { IPermissionData } from 'services/actionPermissions';

// components
import ActionForm from './ActionForm';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import { Box, colors, Title } from '@citizenlab/cl2-component-library';

// utils
import {
  getPermissionActionMessage,
  getPermissionActionSectionSubtitle,
} from './utils';
import UserFieldSelection from '../../components/UserFieldSelection/UserFieldSelection';

const ActionPermissionWrapper = styled.div`
  margin-bottom: 30px;

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
  onChange: (
    permission: IPermissionData,
    permittedBy: IPermissionData['attributes']['permitted_by'],
    groupIds: string[]
  ) => void;
};

type Props = PostTypeProps & SharedProps;

const ActionsForm = memo(
  ({ permissions, postType, onChange, projectId }: Props) => {
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
                <Box mt="42px" mb="20px">
                  <UserFieldSelection permission={permission} />
                </Box>
              </ActionPermissionWrapper>
            );
          })}
        </>
      );
    }
  }
);

export default ActionsForm;
