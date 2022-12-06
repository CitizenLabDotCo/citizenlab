import React, { memo, useState } from 'react';
// components
import { Icon } from '@citizenlab/cl2-component-library';
import useAdminPublications, {
  IAdminPublicationContent,
} from 'hooks/useAdminPublications';
// hooks
import useAuthUser from 'hooks/useAuthUser';
// services
import { isAdmin } from 'services/permissions/roles';
import { userModeratesFolder } from 'services/permissions/rules/projectFolderPermissions';
// typings
import { PublicationStatus } from 'services/projects';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
// types & services
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import PublicationStatusLabel from 'containers/Admin/projects/components/PublicationStatusLabel';
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
  ActionsRowContainer,
} from 'containers/Admin/projects/components/StyledComponents';
import Error from 'components/UI/Error';
// styles
import styled from 'styled-components';
import DeleteProjectFolderButton from '../DeleteProjectFolderButton';
import messages from './messages';

const FolderIcon = styled(Icon)`
  margin-right: 10px;
`;

const ArrowIcon = styled(Icon)<{ expanded: boolean }>`
  flex: 0 0 24px;
  margin-right: 8px;
  transition: transform 350ms cubic-bezier(0.165, 0.84, 0.44, 1),
    fill 80ms ease-out;

  ${({ expanded }) =>
    expanded &&
    `
    transform: rotate(90deg);
  `}
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FolderRowContent = styled(RowContent)<{
  expanded: boolean;
  hasProjects: boolean;
}>`
  ${({ expanded }) =>
    expanded &&
    `
    padding-bottom: 10px;
  `}
  ${({ hasProjects }) =>
    hasProjects &&
    `
    cursor: pointer;
  `}
`;

const ProjectRows = styled.div`
  margin-left: 30px;
`;

const InFolderProjectRow = styled(ProjectRow)`
  padding-bottom: 10px;
  padding-top: 10px;
  border-top: 1px solid ${colors.divider};

  &:last-child {
    padding-bottom: 0;
  }
`;

interface Props {
  publication: IAdminPublicationContent;
}

const publicationStatuses: PublicationStatus[] = [
  'draft',
  'published',
  'archived',
];

const ProjectFolderRow = memo<Props>(({ publication }) => {
  const authUser = useAuthUser();

  const { list: folderChildAdminPublications } = useAdminPublications({
    childrenOfId: publication.relationships.publication.data.id,
    publicationStatusFilter: publicationStatuses,
  });

  const [folderOpen, setFolderOpen] = useState(true);
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [folderDeletionError, setFolderDeletionError] = useState('');

  const toggleExpand = () => setFolderOpen((folderOpen) => !folderOpen);
  const hasProjects =
    !isNilOrError(folderChildAdminPublications) &&
    folderChildAdminPublications.length > 0;

  if (!isNilOrError(authUser)) {
    const userIsAdmin = isAdmin({ data: authUser });

    return (
      <Container>
        <FolderRowContent
          className="e2e-admin-adminPublications-list-item"
          expanded={hasProjects && folderOpen}
          hasProjects={hasProjects}
          role="button"
          onClick={toggleExpand}
        >
          <RowContentInner className="expand primary">
            {hasProjects && (
              <ArrowIcon
                expanded={hasProjects && folderOpen}
                name="chevron-right"
              />
            )}
            <FolderIcon name="folder-outline" />
            <RowTitle
              value={publication.attributes.publication_title_multiloc}
            />
            <PublicationStatusLabel
              publicationStatus={publication.attributes.publication_status}
            />
          </RowContentInner>
          <ActionsRowContainer>
            {userIsAdmin && (
              <DeleteProjectFolderButton
                publication={publication}
                processing={isBeingDeleted}
                setDeletionError={setFolderDeletionError}
                setDeleteIsProcessing={setIsBeingDeleted}
              />
            )}
            <RowButton
              className={`e2e-admin-edit-project ${
                publication.attributes.publication_title_multiloc['en-GB'] || ''
              }`}
              linkTo={`/admin/projects/folders/${publication.publicationId}`}
              buttonStyle="secondary"
              icon="edit"
              disabled={
                isBeingDeleted ||
                !userModeratesFolder(authUser, publication.publicationId)
              }
            >
              <FormattedMessage {...messages.manageButtonLabel} />
            </RowButton>
          </ActionsRowContainer>
        </FolderRowContent>

        {folderDeletionError && <Error text={folderDeletionError} />}

        {hasProjects && folderOpen && (
          <ProjectRows>
            {folderChildAdminPublications.map((publication) => (
              <InFolderProjectRow
                publication={publication}
                key={publication.id}
                actions={userIsAdmin ? ['delete', 'manage'] : ['manage']}
              />
            ))}
          </ProjectRows>
        )}
      </Container>
    );
  }

  return null;
});

export default ProjectFolderRow;
