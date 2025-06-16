import React, { useState } from 'react';

import {
  Box,
  Tr,
  Td,
  Text,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';
import styled from 'styled-components';

import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import ProjectMoreActionsMenu, {
  ActionType,
} from 'containers/Admin/projects/components/ProjectRow/ProjectMoreActionsMenu';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { parseBackendDateString } from 'utils/dateUtils';

import { VISIBILITY_LABELS, PUBLICATION_STATUS_LABELS } from '../constants';

import CurrentPhase from './CurrentPhase';

const StyledTd = styled(Td)`
  &:hover {
    cursor: pointer;
    .project-table-row-title {
      text-decoration: underline;
    }
  }
`;

interface Props {
  project: ProjectMiniAdminData;
}

const Row = ({ project }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const [isBeingDeleted, setIsBeingDeleted] = useState(false);
  const [isBeingCopyied, setIsBeingCopyied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    first_phase_start_date,
    folder_title_multiloc,
    last_phase_end_date,
    publication_status,
    title_multiloc,
    visible_to,
  } = project.attributes;

  const formatDate = (date: string | null) => {
    const parsedDate = parseBackendDateString(date ?? undefined);
    if (!parsedDate) return '';
    return format(parsedDate, 'P', { locale: getLocale(locale) });
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
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/${project.id}`);
        }}
      >
        <Box display="flex" alignItems="center">
          <Box>
            <Text
              m="0"
              fontSize="s"
              color="primary"
              className="project-table-row-title"
            >
              {localize(title_multiloc)}
            </Text>
            {folder_title_multiloc && (
              <Text m="0" fontSize="xs" color="textSecondary">
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
      </StyledTd>
      <Td background={colors.grey50} width="140px">
        <CurrentPhase project={project} />
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatDate(first_phase_start_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatDate(last_phase_end_date)}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatMessage(PUBLICATION_STATUS_LABELS[publication_status])}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatMessage(VISIBILITY_LABELS[visible_to])}
        </Text>
      </Td>
      <Td background={colors.grey50} width="50px">
        <Box mr="12px">
          <ProjectMoreActionsMenu
            projectId={project.id}
            firstPublishedAt={project.attributes.first_published_at}
            folderId={folderId}
            setError={setError}
            setIsRunningAction={handleActionLoading}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
