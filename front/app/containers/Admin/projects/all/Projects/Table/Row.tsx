import React, { useState } from 'react';

import {
  Box,
  Tr,
  Td,
  Text,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import useProjectImage from 'api/project_images/useProjectImage';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';
import { IUser } from 'api/users/types';
import useUsersWithIds from 'api/users/useUsersWithIds';

import useLocalize from 'hooks/useLocalize';

import ProjectMoreActionsMenu, {
  ActionType,
} from 'containers/Admin/projects/components/ProjectRow/ProjectMoreActionsMenu';

import Error from 'components/UI/Error';

import Link from 'utils/cl-router/Link';
import { parseBackendDateString } from 'utils/dateUtils';

import ManagerBubbles from '../../_shared/ManagerBubbles';
import RowImage from '../../_shared/RowImage';

import CurrentPhase from './CurrentPhase';
import Visibility from './Visibility';

interface Props {
  project: ProjectMiniAdminData;
  participantsCount?: number;
  firstRow: boolean;
}

const Row = ({ project, participantsCount, firstRow }: Props) => {
  const localize = useLocalize();

  const imageId = project.relationships.project_images.data[0]?.id;
  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId,
  });

  const imageVersions = image?.data.attributes.versions;
  const imageUrl = imageVersions?.large ?? imageVersions?.medium;

  const [hover, setHover] = useState<'none' | 'project' | 'folder'>('none');

  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [isBeingCopyied, setIsBeingCopyied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    first_phase_start_date,
    folder_title_multiloc,
    last_phase_end_date,
    title_multiloc,
  } = project.attributes;

  const moderatorIds = project.relationships.moderators.data.map(
    (user) => user.id
  );
  const moderatorsData = useUsersWithIds(moderatorIds);
  const moderators = moderatorsData
    .map((result) => result.data)
    .filter((user): user is IUser => !!user);

  const formatDate = (date: string | null) => {
    const parsedDate = date ? parseBackendDateString(date) : undefined;
    if (!parsedDate) return '';
    return parsedDate.toLocaleDateString();
  };

  const folderId = project.relationships.folder?.data?.id;

  const handleActionLoading = (actionType: ActionType, isRunning: boolean) => {
    if (actionType === 'copying') {
      setIsBeingCopyied(isRunning);
    } else {
      setIsBeingDeleted(isRunning);
    }
  };

  const link =
    hover === 'folder'
      ? (`/admin/projects/folders/${folderId}` as const)
      : (`/admin/projects/${project.id}` as const);

  return (
    <Tr dataCy="projects-overview-table-row">
      <Td
        background={colors.grey50}
        onMouseEnter={() => setHover('project')}
        onMouseLeave={() => setHover('none')}
        style={{
          cursor: hover !== 'none' ? 'pointer' : 'default',
        }}
        className={
          firstRow
            ? 'intercom-product-tour-project-page-first-table-row'
            : undefined
        }
      >
        <Box
          display="flex"
          alignItems="center"
          w="100%"
          h="100%"
          as={Link}
          to={link}
        >
          <RowImage
            imageUrl={imageUrl ?? undefined}
            alt={localize(title_multiloc)}
          />
          <Box ml="8px">
            <Text
              m="0"
              fontSize="s"
              textDecoration={hover === 'project' ? 'underline' : 'none'}
            >
              {localize(title_multiloc)}
            </Text>
            {folder_title_multiloc && (
              <Text
                m="0"
                fontSize="xs"
                color="textSecondary"
                textDecoration={hover === 'folder' ? 'underline' : 'none'}
                onMouseEnter={() => setHover('folder')}
                onMouseLeave={() => setHover('project')}
              >
                {localize(folder_title_multiloc)}
              </Text>
            )}
          </Box>
          {(isBeingCopyied || isBeingDeleted) && (
            <Box ml="12px">
              <Spinner size="20px" color={colors.grey400} />
            </Box>
          )}
        </Box>
        {error && (
          <Box mt="8px">
            <Error text={error} />
          </Box>
        )}
      </Td>
      <Td background={colors.grey50} width="1px">
        {participantsCount !== undefined ? (
          <Text m="0" fontSize="s" textAlign="right" mr="12px">
            {participantsCount}
          </Text>
        ) : (
          <Spinner size="16px" />
        )}
      </Td>
      <Td background={colors.grey50} width="1px">
        <CurrentPhase project={project} />
      </Td>
      <Td background={colors.grey50} width="140px">
        <ManagerBubbles
          managers={moderators.map(({ data: { attributes } }) => ({
            first_name: attributes.first_name ?? undefined,
            last_name: attributes.last_name ?? undefined,
            avatar: attributes.avatar,
          }))}
        />
      </Td>
      <Td background={colors.grey50} width="140px">
        <Visibility project={project} />
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s">
          {formatDate(first_phase_start_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s">
          {formatDate(last_phase_end_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="50px">
        <Box mr="12px">
          <ProjectMoreActionsMenu
            projectId={project.id}
            projectName={localize(project.attributes.title_multiloc)}
            firstPublishedAt={project.attributes.first_published_at}
            folderId={folderId}
            color={colors.black}
            setError={setError}
            setIsRunningAction={handleActionLoading}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
