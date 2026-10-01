import React from 'react';

import {
  Box,
  Checkbox,
  colors,
  Icon,
  Td,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';

import IdeaCell from './IdeaCell';

const Row = styled.tr<{ selected: boolean; active: boolean }>`
  cursor: pointer;
  background: ${({ selected, active }) =>
    selected || active ? colors.grey100 : colors.white};

  &:hover {
    background: ${colors.grey50};
  }
`;

const cellProps = {
  py: '8px',
  borderBottom: `1px solid ${colors.divider}`,
};

interface Props {
  idea: IIdeaData;
  columns: ColumnKey[];
  statuses: IIdeaStatusData[];
  tagLabels: Map<string, string>;
  selected: boolean;
  active: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

const IdeaRow = ({
  idea,
  columns,
  statuses,
  tagLabels,
  selected,
  active,
  onToggleSelect,
  onOpen,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { attributes, relationships } = idea;
  const status = statuses.find(
    (status) => status.id === relationships.idea_status.data?.id
  );
  const showsMark = (column: ColumnKey) => columns.includes(column);
  const wasImported = !!relationships.idea_import?.data;
  const hasReply = attributes.official_feedbacks_count > 0;

  return (
    <Row
      selected={selected}
      active={active}
      data-cy={`e2e-idea-row-${idea.id}`}
    >
      <Td {...cellProps} width="40px" pr="0">
        <Checkbox
          size="18px"
          checked={selected}
          onChange={onToggleSelect}
          ariaLabel={formatMessage(messages.selectInput)}
        />
      </Td>
      <Td {...cellProps} onClick={onOpen} maxWidth="0" width="100%">
        <Box display="flex" alignItems="center" gap="8px">
          <Text
            variant="boLabel"
            color="textPrimary"
            as="span"
            m="0"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
          >
            {localize(attributes.title_multiloc)}
          </Text>
          {showsMark('replied') && hasReply && (
            <Tooltip content={formatMessage(messages.repliedMark)} theme="dark">
              <Icon name="chat-bubble" width="16px" fill={colors.coolGrey500} />
            </Tooltip>
          )}
          {showsMark('imported') && wasImported && (
            <Tooltip
              content={formatMessage(messages.sourceImported)}
              theme="dark"
            >
              <Icon name="download" width="16px" fill={colors.coolGrey500} />
            </Tooltip>
          )}
        </Box>
      </Td>
      {columns
        .filter((column) => !COLUMNS[column].mark)
        .map((column) => (
          <Td key={column} {...cellProps} onClick={onOpen}>
            <IdeaCell
              column={column}
              idea={idea}
              status={status}
              tagLabels={tagLabels}
            />
          </Td>
        ))}
      <Td {...cellProps} onClick={onOpen} />
    </Row>
  );
};

export default IdeaRow;
