import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Box } from '@citizenlab/cl2-component-library';
import Error from 'components/UI/Error';
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
} from 'containers/Admin/projects/components/StyledComponents';
import FolderMoreActionsMenu from './FolderMoreActionsMenu';
import PublicationStatusLabel from 'containers/Admin/projects/components/PublicationStatusLabel';

// styles
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

// services
import { userModeratesFolder } from 'services/permissions/rules/projectFolderPermissions';

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

const FolderRowContent = styled(RowContent)<{
  hasProjects: boolean;
}>`
  flex-grow: 1;

  ${({ hasProjects }) =>
    hasProjects &&
    `
    cursor: pointer;
  `}
`;

export interface Props {
  publication: IAdminPublicationContent;
  toggleFolder: () => void;
  folderOpen: boolean;
  hasProjects: boolean;
}

const ProjectFolderRow = memo<Props>(
  ({ publication, toggleFolder, folderOpen, hasProjects }) => {
    const authUser = useAuthUser();

    const [folderDeletionError, setFolderDeletionError] = useState<
      string | null
    >(null);

    if (!isNilOrError(authUser)) {
      return (
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            alignItems="flex-start"
          >
            <Box width="100%" display="flex" alignItems="center">
              <FolderRowContent
                className="e2e-admin-adminPublications-list-item"
                hasProjects={hasProjects}
                role="button"
                onClick={toggleFolder}
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
                    publicationStatus={
                      publication.attributes.publication_status
                    }
                  />
                </RowContentInner>
                <RowButton
                  className={`e2e-admin-edit-project ${
                    publication.attributes.publication_title_multiloc[
                      'en-GB'
                    ] || ''
                  }`}
                  linkTo={`/admin/projects/folders/${publication.publicationId}`}
                  buttonStyle="secondary"
                  icon="edit"
                  disabled={
                    !userModeratesFolder(authUser, publication.publicationId)
                  }
                  data-testid="folder-row-edit-button"
                >
                  <FormattedMessage {...messages.edit} />
                </RowButton>
              </FolderRowContent>
              <FolderMoreActionsMenu
                folderId={publication.publicationId}
                setError={setFolderDeletionError}
              />
            </Box>

            {folderDeletionError && <Error text={folderDeletionError} />}
          </Box>
        </Box>
      );
    }

    return null;
  }
);

export default ProjectFolderRow;
