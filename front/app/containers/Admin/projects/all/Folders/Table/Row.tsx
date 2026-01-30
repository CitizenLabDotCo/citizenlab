import React, { useState } from 'react';

import {
  Box,
  Tr,
  Td,
  Text,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import { MiniProjectFolder } from 'api/project_folders_mini/types';
import { IUser } from 'api/users/types';
import useUsersWithIds from 'api/users/useUsersWithIds';

import useLocalize from 'hooks/useLocalize';

import FolderMoreActionsMenu from 'containers/Admin/projects/projectFolders/components/ProjectFolderRow/FolderMoreActionsMenu';

import Error from 'components/UI/Error';
import GanttItemIconBar from 'components/UI/GanttChart/components/GanttItemIconBar';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { PUBLICATION_STATUS_LABELS } from '../../_shared/constants';
import ManagerBubbles from '../../_shared/ManagerBubbles';
import RowImage from '../../_shared/RowImage';
import { getStatusColor } from '../../_shared/utils';

import messages from './messages';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  folder: MiniProjectFolder;
}

const Row = ({ folder }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: folderImage } = useProjectFolderImage({
    folderId: folder.id,
    imageId: folder.relationships.images.data[0]?.id,
  });

  const moderatorIds = folder.relationships.moderators.data.map(
    (user) => user.id
  );
  const moderatorsData = useUsersWithIds(moderatorIds);
  const moderators = moderatorsData
    .map((result) => result.data)
    .filter((user): user is IUser => !!user);

  const { publication_status } = folder.attributes;

  return (
    <Tr dataCy="projects-overview-folder-table-row">
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/folders/${folder.id}`);
        }}
      >
        <Box display="flex" alignItems="center">
          <RowImage
            imageUrl={folderImage?.data.attributes.versions.small ?? undefined}
            alt={localize(folder.attributes.title_multiloc)}
          />
          <Box ml="8px">
            <Text
              m="0"
              fontSize="s"
              color="black"
              className="project-table-row-title"
            >
              {localize(folder.attributes.title_multiloc)}
            </Text>
            <Text m="0" fontSize="xs" color="textSecondary">
              {formatMessage(messages.numberOfProjects, {
                numberOfProjects: folder.attributes.visible_projects_count,
              })}
            </Text>
          </Box>
          {isBeingDeleted && (
            <Box ml="16px">
              <Spinner size="20px" color={colors.grey400} />
            </Box>
          )}
        </Box>
        {error && (
          <Box mt="8px">
            <Error text={error} />
          </Box>
        )}
      </StyledTd>
      <Td background={colors.grey50} width="260px">
        <ManagerBubbles
          managers={moderators.map(({ data: { attributes } }) => ({
            first_name: attributes.first_name ?? undefined,
            last_name: attributes.last_name ?? undefined,
            avatar: attributes.avatar,
          }))}
        />
      </Td>
      <Td background={colors.grey50} width="100px">
        <Box display="flex">
          <GanttItemIconBar
            color={getStatusColor(publication_status)}
            rowHeight={32}
            ml="0"
            mr="8px"
          />
          <Text m="0" fontSize="s" color="black">
            {formatMessage(PUBLICATION_STATUS_LABELS[publication_status])}
          </Text>
        </Box>
      </Td>
      <Td background={colors.grey50} width="40px">
        <Box mr="12px">
          <FolderMoreActionsMenu
            folderId={folder.id}
            folderName={localize(folder.attributes.title_multiloc)}
            color={colors.black}
            setError={setError}
            setIsRunningAction={setIsBeingDeleted}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
