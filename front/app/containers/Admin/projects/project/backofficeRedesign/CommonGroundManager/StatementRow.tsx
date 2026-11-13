import React from 'react';

import { Checkbox, colors, Td, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import AssigneeMark from '../InputManager/IdeaTable/AssigneeMark';

import messages from './messages';
import { totalReactions } from './utils';

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
  showModeration: boolean;
  /** Absent for a statement without reactions. */
  result: CommonGroundResultItem | undefined;
  selected: boolean;
  active: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
}

const StatementRow = ({
  idea,
  showModeration,
  result,
  selected,
  active,
  onToggleSelect,
  onOpen,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  return (
    <Row
      selected={selected}
      active={active}
      data-cy={`e2e-statement-row-${idea.id}`}
    >
      <Td {...cellProps} width="40px" pr="0">
        <Checkbox
          size="18px"
          checked={selected}
          onChange={onToggleSelect}
          ariaLabel={formatMessage(messages.selectStatement)}
        />
      </Td>
      <Td {...cellProps} onClick={onOpen} maxWidth="0" width="100%">
        <Text
          variant="boLabel"
          color="textPrimary"
          as="span"
          display="block"
          m="0"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {localize(idea.attributes.title_multiloc)}
        </Text>
      </Td>
      {showModeration && (
        <>
          <Td {...cellProps} onClick={onOpen}>
            <AssigneeMark assigneeId={idea.relationships.assignee?.data?.id} />
          </Td>
          <Td {...cellProps} onClick={onOpen}>
            <Text variant="boLabel" as="span" m="0">
              {idea.attributes.likes_count}
            </Text>
          </Td>
        </>
      )}
      <Td {...cellProps} onClick={onOpen}>
        <Text variant="boLabel" as="span" m="0">
          {result?.agree_percent ?? 0}%
        </Text>
      </Td>
      <Td {...cellProps} onClick={onOpen}>
        <Text variant="boLabel" as="span" m="0">
          {totalReactions(result?.votes)}
        </Text>
      </Td>
    </Row>
  );
};

export default StatementRow;
