import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// components
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
  ActionsRowContainer,
} from '../StyledComponents';
import PublicationStatusLabel from '../PublicationStatusLabel';
import {
  IconNames,
  StatusLabel,
  Spinner,
  Box,
  colors,
} from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import GroupsTag from './GroupsTag';
import AdminTag from './AdminTag';
import ManageButton from './ManageButton';

// resources
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';

// types
import ProjectMoreActionsMenu, { ActionType } from './ProjectMoreActionsMenu';
import { IAdminPublicationData } from 'api/admin_publications/types';

export const StyledStatusLabel = styled(StatusLabel)`
  margin-right: 5px;
  margin-top: 4px;
  margin-bottom: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type CustomButtonAction = {
  buttonContent: JSX.Element;
  handler: (publicationId: string) => () => void;
  icon: IconNames;
  processing?: boolean;
};
type ButtonAction = CustomButtonAction | 'manage';

export interface Props {
  publication: IAdminPublicationData;
  actions: ButtonAction[];
  hidePublicationStatusLabel?: boolean;
  className?: string;
  hideMoreActions?: boolean;
}

const ProjectRow = ({
  publication,
  actions,
  hidePublicationStatusLabel,
  className,
  hideMoreActions = false,
}: Props) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBeingCopyied, setIsBeingCopyied] = useState(false);
  const { data: authUser } = useAuthUser();
  const projectId = publication.relationships.publication.data.id;
  const { data: project } = useProjectById(projectId);
  const publicationStatus = publication.attributes.publication_status;
  const folderId = project?.data.attributes.folder_id;

  if (isNilOrError(authUser)) {
    return null;
  }
  const userCanModerateProject =
    // This means project is in a folder
    (typeof folderId === 'string' &&
      userModeratesFolder(authUser.data, folderId)) ||
    canModerateProject(publication.relationships.publication.data.id, {
      data: authUser.data,
    });

  const handleActionLoading = (actionType: ActionType, isRunning: boolean) => {
    if (actionType === 'copying') {
      setIsBeingCopyied(isRunning);
    } else if (actionType === 'deleting') {
      setIsBeingDeleted(isRunning);
    }
  };

  return (
    <Container className={className} data-testid="projectRow">
      <RowContent className="e2e-admin-projects-list-item">
        <RowContentInner className="expand primary">
          <RowTitle value={publication.attributes.publication_title_multiloc} />
          {(isBeingCopyied || isBeingDeleted) && (
            <Box mr="12px">
              <Spinner size="20px" color={colors.grey400} />
            </Box>
          )}
          {publication.attributes.publication_visible_to === 'groups' && (
            <GroupsTag
              projectId={projectId}
              userCanModerateProject={userCanModerateProject}
            />
          )}
          {publication.attributes.publication_visible_to === 'admins' && (
            <AdminTag
              projectId={projectId}
              userCanModerateProject={userCanModerateProject}
            />
          )}
          {!hidePublicationStatusLabel && (
            <PublicationStatusLabel publicationStatus={publicationStatus} />
          )}
        </RowContentInner>
        <ActionsRowContainer>
          {actions.map((action) => {
            if (action === 'manage') {
              return (
                <ManageButton
                  isDisabled={!userCanModerateProject}
                  publicationId={publication.relationships.publication.data.id}
                  key="manage"
                />
              );
            } else {
              return (
                <RowButton
                  data-cy={`e2e-manage-button-${publication.relationships.publication.data.id}`}
                  key={action.icon}
                  type="button"
                  className={[
                    'e2e-admin-edit-publication',
                    publication.attributes.publication_title_multiloc?.[
                      'en-GB'
                    ],
                  ]
                    .filter((item) => item)
                    .join(' ')}
                  onClick={action.handler(
                    publication.relationships.publication.data.id
                  )}
                  buttonStyle="secondary"
                  icon={action.icon}
                  processing={action.processing}
                >
                  {action.buttonContent}
                </RowButton>
              );
            }
          })}
          {!hideMoreActions && (
            <ProjectMoreActionsMenu
              projectId={projectId}
              setError={setError}
              setIsRunningAction={handleActionLoading}
            />
          )}
        </ActionsRowContainer>
      </RowContent>
      {error && <Error text={error} />}
    </Container>
  );
};

export default ProjectRow;
