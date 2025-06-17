import React from 'react';

import { Box, Tr, Td, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { MiniProjectFolder } from 'api/project_folders_mini/types';

import useLocalize from 'hooks/useLocalize';

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
      </StyledTd>
      <Td background={colors.grey50}>
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
      <Td background={colors.grey50}>
        <Text m="0" fontSize="s" color="primary">
          {formatMessage(PUBLICATION_STATUS_LABELS[publication_status])}
        </Text>
      </Td>
    </Tr>
  );
};

export default Row;
