import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from 'cl2-component-library';
import Error from 'components/UI/Error';
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
  ActionsRowContainer,
} from 'containers/Admin/projects/components/StyledComponents';

// styles
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import useAuthUser from 'hooks/useAuthUser';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { isAdmin } from 'services/permissions/roles';

const FolderIcon = styled(Icon)`
  margin-right: 10px;
  height: 14px;
  width: 17px;
`;

// types & services
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';
import { adopt } from 'react-adopt';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import { colors } from 'utils/styleUtils';
import PublicationStatusLabel from 'containers/Admin/projects/components/PublicationStatusLabel';
import DeleteProjectFolderButton from '../DeleteProjectFolderButton';

const ArrowIcon = styled(Icon)<{ expanded: boolean }>`
  flex: 0 0 11px;
  height: 11px;
  width: 11px;
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
  border-top: 1px solid ${colors.separation};

  &:last-child {
    padding-bottom: 0;
  }
`;

interface InputProps {
  publication: IAdminPublicationContent;
}

interface DataProps {
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {}

const ProjectFolderRow = memo<Props>(({ publication, adminPublications }) => {
  const authUser = useAuthUser();

  const [folderOpen, setFolderOpen] = useState(false);
  const [isBeingDeleted, setIsBeingDeleted] = useState<boolean>(false);
  const [folderDeletionError, setFolderDeletionError] = useState<string>('');

  const toggleExpand = () => setFolderOpen((folderOpen) => !folderOpen);

  if (!isNilOrError(authUser)) {
    const hasProjects =
      !isNilOrError(adminPublications) &&
      !!adminPublications.list?.length &&
      adminPublications.list.length > 0;
    const userCanDeletePublication = isAdmin({ data: authUser });

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
            <FolderIcon name="simpleFolder" />
            <RowTitle
              value={publication.attributes.publication_title_multiloc}
            />
            <PublicationStatusLabel
              publicationStatus={publication.attributes.publication_status}
            />
          </RowContentInner>
          <ActionsRowContainer>
            {userCanDeletePublication && (
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
              disabled={isBeingDeleted}
            >
              <FormattedMessage {...messages.manageButtonLabel} />
            </RowButton>
          </ActionsRowContainer>
        </FolderRowContent>

        {folderDeletionError && <Error text={folderDeletionError} />}

        {hasProjects && folderOpen && (
          <ProjectRows>
            {adminPublications?.list?.map((publication) => (
              <InFolderProjectRow
                publication={publication}
                key={publication.id}
                actions={
                  isAdmin({ data: authUser })
                    ? ['delete', 'manage']
                    : ['manage']
                }
              />
            ))}
          </ProjectRows>
        )}
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  adminPublications: ({ publication: { publicationId }, render }) => (
    <GetAdminPublications
      folderId={publicationId}
      publicationStatusFilter={['draft', 'published', 'archived']}
    >
      {render}
    </GetAdminPublications>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <ProjectFolderRow {...inputProps} {...dataprops} />}
  </Data>
);
