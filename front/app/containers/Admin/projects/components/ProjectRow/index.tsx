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
import { IconNames, StatusLabel } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import GroupsTag from './GroupsTag';
import AdminTag from './AdminTag';
import ManageButton from './ManageButton';

// resources
import { canModerateProject } from 'services/permissions/rules/projectPermissions';
import useAuthUser from 'hooks/useAuthUser';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import ProjectMoreActionsMenu from './ProjectMoreActionsMenu';

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
  showMoreActions?: boolean;
}

const ProjectRow = ({
  publication,
  actions,
  hidePublicationStatusLabel,
  className,
  showMoreActions = false,
}: Props) => {
  const [isBeingDeleted, _setIsBeingDeleted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const authUser = useAuthUser();
  const projectId = publication.publicationId;
  const publicationStatus = publication.attributes.publication_status;
  const userCanModerateProject =
    !isNilOrError(authUser) &&
    canModerateProject(publication.publicationId, { data: authUser });

  return (
    <Container className={className}>
      <RowContent className="e2e-admin-projects-list-item">
        <RowContentInner className="expand primary">
          <RowTitle value={publication.attributes.publication_title_multiloc} />
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
                  isDisabled={isBeingDeleted || !userCanModerateProject}
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
                  disabled={isBeingDeleted}
                >
                  {action.buttonContent}
                </RowButton>
              );
            }
          })}
          {showMoreActions && (
            <ProjectMoreActionsMenu projectId={projectId} setError={setError} />
          )}
        </ActionsRowContainer>
      </RowContent>
      {error && <Error text={error} />}
    </Container>
  );
};

export default ProjectRow;
