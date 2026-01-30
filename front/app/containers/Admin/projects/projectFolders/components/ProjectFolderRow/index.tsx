import React, { memo, useState } from 'react';

import { Icon, Box, Spinner, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useAuthUser from 'api/me/useAuthUser';

import PublicationStatusLabel from 'containers/Admin/projects/components/PublicationStatusLabel';
import {
  RowContent,
  RowContentInner,
  RowTitle,
  RowButton,
} from 'containers/Admin/projects/components/StyledComponents';

import useLocalize from 'hooks/useLocalize';

import Error from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';

import FolderMoreActionsMenu from './FolderMoreActionsMenu';
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
  publication: IAdminPublicationData;
  toggleFolder: () => void;
  isFolderOpen: boolean;
  hasProjects: boolean;
}

const ProjectFolderRow = memo<Props>(
  ({ publication, toggleFolder, isFolderOpen, hasProjects }) => {
    const { data: authUser } = useAuthUser();
    const localize = useLocalize();

    const [folderDeletionError, setFolderDeletionError] = useState<
      string | null
    >(null);
    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const handleClick = () => {
      if (hasProjects) {
        toggleFolder();
      }
    };

    if (!isNilOrError(authUser)) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          data-cy="e2e-project-folder-row"
        >
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            alignItems="flex-start"
          >
            <Box width="100%" display="flex" alignItems="center">
              <FolderRowContent
                className="e2e-admin-adminPublications-list-item"
                data-testid="folder-row"
                hasProjects={hasProjects}
                as="button"
                onClick={handleClick}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                >
                  <RowContentInner className="expand primary">
                    {hasProjects && (
                      <ArrowIcon
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        expanded={hasProjects && isFolderOpen}
                        name="chevron-right"
                      />
                    )}

                    <FolderIcon name="folder-outline" />

                    <RowTitle
                      value={publication.attributes.publication_title_multiloc}
                    />
                    {isBeingDeleted && (
                      <Box>
                        <Spinner size="20px" color={colors.grey400} />
                      </Box>
                    )}
                  </RowContentInner>
                  <PublicationStatusLabel
                    publicationStatus={
                      publication.attributes.publication_status
                    }
                  />
                </Box>
                <RowButton
                  className={`e2e-admin-edit-project ${
                    publication.attributes.publication_title_multiloc[
                      'en-GB'
                    ] || ''
                  }`}
                  linkTo={`/admin/projects/folders/${publication.relationships.publication.data.id}`}
                  buttonStyle="secondary-outlined"
                  icon="edit"
                  disabled={
                    isBeingDeleted ||
                    !userModeratesFolder(
                      authUser,
                      publication.relationships.publication.data.id
                    )
                  }
                  data-testid="folder-row-edit-button"
                >
                  <FormattedMessage {...messages.edit} />
                </RowButton>
              </FolderRowContent>
              <FolderMoreActionsMenu
                folderId={publication.relationships.publication.data.id}
                folderName={localize(
                  publication.attributes.publication_title_multiloc
                )}
                setError={setFolderDeletionError}
                setIsRunningAction={setIsBeingDeleted}
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
