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
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import useAuthUser from 'hooks/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import { userModeratesFolder } from 'services/permissions/rules/projectFolderPermissions';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import ProjectMoreActionsMenu, { ActionType } from './ProjectMoreActionsMenu';

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
  publication: IAdminPublicationContent;
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
  const authUser = useAuthUser();
  const projectId = publication.publicationId;
  const { data: project } = useProjectById(projectId);
  const publicationStatus = publication.attributes.publication_status;
  const folderId = project?.data.attributes.folder_id;

  if (isNilOrError(authUser)) {
    return null;
  }
  const userCanModerateProject =
    // This means project is in a folder
    (typeof folderId === 'string' && userModeratesFolder(authUser, folderId)) ||
    canModerateProject(publication.publicationId, {
      data: authUser,
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
                  publicationId={publication.publicationId}
                  key="manage"
                />
              );
            } else {
              return (
                <RowButton
                  data-cy={`e2e-manage-button-${publication.publicationId}`}
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
                  onClick={action.handler(publication.publicationId)}
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
