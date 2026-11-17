import React from 'react';

import Checkbox from 'design-system/Checkbox';
import { Cell, Row } from 'design-system/Table';

import { CommonGroundResultItem } from 'api/common_ground/types';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import AssigneeMark from '../InputManager/IdeaTable/AssigneeMark';
import RowTitleButton from '../InputManager/IdeaTable/RowTitleButton';

import messages from './messages';
import { totalReactions } from './utils';

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
  const title = localize(idea.attributes.title_multiloc);

  return (
    <Row
      id={idea.id}
      kind="flat"
      textValue={title}
      isActive={active}
      isPicked={selected}
      onAction={onOpen}
      data-cy={`e2e-statement-row-${idea.id}`}
    >
      <Cell>
        <Checkbox
          isSelected={selected}
          onChange={onToggleSelect}
          aria-label={formatMessage(messages.selectStatement)}
        />
      </Cell>
      <Cell>
        <RowTitleButton title={title} onOpen={onOpen} />
      </Cell>
      {showModeration && (
        <Cell>
          <AssigneeMark assigneeId={idea.relationships.assignee?.data?.id} />
        </Cell>
      )}
      {showModeration && (
        <Cell tone="secondary">{idea.attributes.likes_count}</Cell>
      )}
      <Cell tone="secondary">{result?.agree_percent ?? 0}%</Cell>
      <Cell tone="secondary">{totalReactions(result?.votes)}</Cell>
    </Row>
  );
};

export default StatementRow;
