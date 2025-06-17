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

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import useLocalize from 'hooks/useLocalize';

import FolderMoreActionsMenu from 'containers/Admin/projects/projectFolders/components/ProjectFolderRow/FolderMoreActionsMenu';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import { PUBLICATION_STATUS_LABELS } from '../../constants';

import messages from './messages';
import User from './User';

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

  const moderators = folder.relationships.moderators.data;
  const { publication_status } = folder.attributes;

  return (
    <Tr>
      <StyledTd
        background={colors.grey50}
        onClick={() => {
          clHistory.push(`/admin/projects/folders/${folder.id}`);
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
        <Text m="0" fontSize="s" color="primary">
          {moderators.map((moderator, index) => (
            <>
              <User userId={moderator.id} key={moderator.id} />
              {index < moderators.length - 1 && (
                <Box as="span" mr="0.25rem">
                  ,
                </Box>
              )}
            </>
          ))}
        </Text>
      </Td>
      <Td background={colors.grey50} width="100px">
        <Text m="0" fontSize="s" color="primary">
          {formatMessage(PUBLICATION_STATUS_LABELS[publication_status])}
        </Text>
      </Td>
      <Td background={colors.grey50} width="40px">
        <Box mr="12px">
          <FolderMoreActionsMenu
            folderId={folder.id}
            setError={setError}
            setIsRunningAction={setIsBeingDeleted}
          />
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
