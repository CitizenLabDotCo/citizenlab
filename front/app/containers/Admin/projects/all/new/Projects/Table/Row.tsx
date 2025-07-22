import React, { useState } from 'react';

import {
  Box,
  Tr,
  Td,
  Text,
  Spinner,
  colors,
  Image,
} from '@citizenlab/cl2-component-library';

import useProjectImage from 'api/project_images/useProjectImage';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import ProjectMoreActionsMenu, {
  ActionType,
} from 'containers/Admin/projects/components/ProjectRow/ProjectMoreActionsMenu';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { parseBackendDateString } from 'utils/dateUtils';

import { VISIBILITY_LABELS } from '../constants';

import CurrentPhase from './CurrentPhase';
import Managers from './Managers';

interface Props {
  project: ProjectMiniAdminData;
  participantsCount?: number;
}

const Row = ({ project, participantsCount }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

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
    // publication_status,
    title_multiloc,
    visible_to,
  } = project.attributes;

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

  return (
    <Tr>
      <Td
        background={colors.grey50}
        onMouseEnter={() => setHover('project')}
        onMouseLeave={() => setHover('none')}
        onClick={() => {
          hover === 'project'
            ? clHistory.push(`/admin/projects/${project.id}`)
            : clHistory.push(`/admin/projects/folders/${folderId}`);
        }}
        style={{
          cursor: hover !== 'none' ? 'pointer' : 'default',
        }}
      >
        <Box display="flex" alignItems="center">
          <Box
            width="32px"
            height="32px"
            display="flex"
            position="relative"
            overflow="hidden"
            borderRadius="4px"
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={localize(title_multiloc)}
                position="absolute"
                width="100%"
                height="100%"
                top="0"
                left="0"
              />
            )}
          </Box>
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
        <Managers project={project} />
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
      <Td background={colors.grey50} width="1px">
        <Text m="0" fontSize="s">
          {formatMessage(VISIBILITY_LABELS[visible_to])}
        </Text>
      </Td>
      <Td background={colors.grey50} width="50px">
        <Box mr="12px">
          <ProjectMoreActionsMenu
            projectId={project.id}
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
