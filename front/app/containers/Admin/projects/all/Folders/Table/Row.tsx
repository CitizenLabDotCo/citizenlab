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
import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import FolderMoreActionsMenu from 'containers/Admin/projects/projectFolders/components/ProjectFolderRow/FolderMoreActionsMenu';

import Error from 'components/UI/Error';
import GanttItemIconBar from 'components/UI/GanttChart/components/GanttItemIconBar';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { usePermission } from 'utils/permissions';

import { PUBLICATION_STATUS_LABELS } from '../../_shared/constants';
import ManagerBubbles from '../../_shared/ManagerBubbles';
import RowImage from '../../_shared/RowImage';
import RowLabel from '../../_shared/RowLabel';
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
  moderatorsById?: Record<string, IUserData>;
}

const Row = ({ folder, moderatorsById }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [hoveringSpace, setHoveringSpace] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: folderImage } = useProjectFolderImage({
    folderId: folder.id,
    imageId: folder.relationships.images.data[0]?.id,
  });

  const moderatorIds = folder.relationships.moderators.data.map(
    (user) => user.id
  );
  const moderators = moderatorsById
    ? moderatorIds.map((id) => moderatorsById[id])
    : [];

  const { publication_status, space_id, space_title_multiloc } =
    folder.attributes;
  const canModerateThisSpace = usePermission({
    item: 'space',
    action: 'manage_projects_and_folders',
    context: { spaceId: space_id },
  });
  const showSpace = spacesEnabled && !!space_title_multiloc && !!space_id;
  // `hoveringSpace` goes stale if the label unmounts or loses its handlers
  // while hovered (React fires no onMouseLeave on unmount), so derive the live
  // condition rather than trusting the raw state.
  const spaceLabelHovered = hoveringSpace && showSpace && canModerateThisSpace;

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
              // Suspend the Td-hover underline while the space label is
              // hovered, so only the actual click target is underlined.
              className={
                spaceLabelHovered ? undefined : 'project-table-row-title'
              }
            >
              {localize(folder.attributes.title_multiloc)}
            </Text>
            <Box
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              gap="2px 4px"
            >
              {showSpace && (
                <>
                  <RowLabel
                    iconName="spaces"
                    titleMultiloc={space_title_multiloc}
                    underline={spaceLabelHovered}
                    onHoverChange={
                      canModerateThisSpace ? setHoveringSpace : undefined
                    }
                    onClick={
                      canModerateThisSpace
                        ? (event) => {
                            event.stopPropagation();
                            clHistory.push(
                              `/admin/projects/spaces/${space_id}`
                            );
                          }
                        : undefined
                    }
                  />
                  <Text m="0" fontSize="xs" color="textSecondary">
                    ·
                  </Text>
                </>
              )}
              <Text m="0" fontSize="xs" color="textSecondary">
                {formatMessage(messages.numberOfProjects, {
                  numberOfProjects: folder.attributes.visible_projects_count,
                })}
              </Text>
            </Box>
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
          managers={moderators.map(({ attributes }) => ({
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
