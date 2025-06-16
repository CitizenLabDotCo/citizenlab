import React, { useState } from 'react';

import {
  IconNames,
  StatusLabel,
  Spinner,
  Box,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAdminPublication from 'api/admin_publications/useAdminPublication';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import Error from 'components/UI/Error';

import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import PublicationStatusLabel from '../PublicationStatusLabel';
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
  ActionsRowContainer,
} from '../StyledComponents';

import AdminTag from './AdminTag';
import GroupsTag from './GroupsTag';
import ManageButton from './ManageButton';
import ProjectMoreActionsMenu, { ActionType } from './ProjectMoreActionsMenu';

export const StyledStatusLabel = styled(StatusLabel)`
  height: 20px;
  padding-left: 4px;
  padding-right: 4px;
  font-weight: bold;
  font-size: 10px;
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
  folderId?: string | null;
  showParent?: boolean;
}

const ProjectRow = ({
  publication,
  actions,
  hidePublicationStatusLabel,
  className,
  hideMoreActions = false,
  folderId,
  showParent = false,
}: Props) => {
  const [isBeingDeleted, setIsBeingDeleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBeingCopyied, setIsBeingCopyied] = useState(false);
  const { data: authUser } = useAuthUser();
  const projectId = publication.relationships.publication.data.id;
  const publicationStatus = publication.attributes.publication_status;
  const { data: project } = useProjectById(projectId);

  const { data: parentPublication } = useAdminPublication(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    publication.relationships.parent?.data?.id || null
  );
  const localize = useLocalize();

  if (!authUser || !project) {
    return null;
  }

  const userCanModerateProject = canModerateProject(project.data, authUser);

  const handleActionLoading = (actionType: ActionType, isRunning: boolean) => {
    if (actionType === 'copying') {
      setIsBeingCopyied(isRunning);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (actionType === 'deleting') {
      setIsBeingDeleted(isRunning);
    }
  };

  return (
    <Container className={className} data-testid="projectRow">
      <RowContent className="e2e-admin-projects-list-item">
        <Box display="flex" flexDirection="column">
          <RowContentInner className="expand primary">
            <RowTitle
              value={publication.attributes.publication_title_multiloc}
            />
            {(isBeingCopyied || isBeingDeleted) && (
              <Box mr="12px">
                <Spinner size="20px" color={colors.grey400} />
              </Box>
            )}
          </RowContentInner>
          <Box display="flex" gap="4px" alignItems="stretch">
            {parentPublication && showParent && (
              <Box
                display="flex"
                gap="4px"
                alignItems="center"
                mr="4px"
                color={colors.textSecondary}
              >
                <Icon
                  name="folder-solid"
                  width="20px"
                  height="20px"
                  fill={colors.textSecondary}
                />
                <span>
                  {localize(
                    parentPublication.data.attributes.publication_title_multiloc
                  )}
                </span>
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
          </Box>
        </Box>
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
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    publication.attributes.publication_title_multiloc?.[
                      'en-GB'
                    ],
                  ]
                    .filter((item) => item)
                    .join(' ')}
                  onClick={action.handler(
                    publication.relationships.publication.data.id
                  )}
                  buttonStyle="secondary-outlined"
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
              firstPublishedAt={project.data.attributes.first_published_at}
              folderId={folderId ? folderId : undefined}
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
