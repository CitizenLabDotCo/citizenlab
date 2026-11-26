import React from 'react';

import { Cell, Row } from 'design-system/Table';
import Text from 'design-system/Text';

import { CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import AssigneeMark from '../InputManager/IdeaTable/AssigneeMark';
import RowTitleButton from '../InputManager/IdeaTable/RowTitleButton';

import { totalReactions } from './utils';

interface Props {
  idea: IIdeaData;
  showModeration: boolean;
  /** Absent for a statement without reactions. */
  result: CommonGroundResultItem | undefined;
  active: boolean;
  onOpen: () => void;
}

const StatementRow = ({
  idea,
  showModeration,
  result,
  active,
  onOpen,
}: Props) => {
  const localize = useLocalize();
  const title = localize(idea.attributes.title_multiloc);

  return (
    <Row
      id={idea.id}
      textValue={title}
      isActive={active}
      onAction={onOpen}
      data-cy={`e2e-statement-row-${idea.id}`}
    >
      <Cell>
        <RowTitleButton title={title} onOpen={onOpen} />
      </Cell>
      {showModeration && (
        <Cell>
          <AssigneeMark
            assigneeId={idea.relationships.assignee?.data?.id}
            size={16}
          />
        </Cell>
      )}
      {showModeration && (
        <Cell tone="secondary" align="end">
          {idea.attributes.likes_count || (
            <Text as="span" variant="ui" tone="tertiary">
              –
            </Text>
          )}
        </Cell>
      )}
      <Cell align="end">{result?.agree_percent ?? 0}%</Cell>
      <Cell tone="secondary" align="end">
        {totalReactions(result?.votes)}
      </Cell>
    </Row>
  );
};

export default StatementRow;
