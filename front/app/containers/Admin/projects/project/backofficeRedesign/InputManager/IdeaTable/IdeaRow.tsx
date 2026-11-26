import React from 'react';

import Icon from 'design-system/Icon';
import { Cell, Row } from 'design-system/Table';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import useIdeaImage from 'api/idea_images/useIdeaImage';
import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { ColumnKey, COLUMNS } from '../columns';
import messages from '../messages';

import IdeaCell from './IdeaCell';
import styles from './IdeaTable.module.css';
import RowTitleButton from './RowTitleButton';

interface Props {
  idea: IIdeaData;
  columns: ColumnKey[];
  statuses: IIdeaStatusData[];
  tagLabels: Map<string, string>;
  active: boolean;
  showVoteThumbnail: boolean;
  leadingVoteCount?: number;
  onOpen: () => void;
}

const IdeaRow = ({
  idea,
  columns,
  statuses,
  tagLabels,
  active,
  showVoteThumbnail,
  leadingVoteCount,
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
  const title = localize(attributes.title_multiloc);
  const { data: image } = useIdeaImage(
    idea.id,
    showVoteThumbnail ? relationships.idea_images.data?.[0]?.id : undefined
  );
  const thumbnail = image?.data.attributes.versions.small;

  return (
    <Row
      id={idea.id}
      textValue={title}
      isActive={active}
      onAction={onOpen}
      data-cy={`e2e-idea-row-${idea.id}`}
    >
      <Cell>
        {showVoteThumbnail && (
          <span className={styles.thumbnail} aria-hidden>
            {thumbnail ? (
              <img src={thumbnail} alt="" loading="lazy" />
            ) : (
              <Icon name="image-14" />
            )}
          </span>
        )}
        <RowTitleButton title={title} onOpen={onOpen} />
        {showsMark('replied') && hasReply && (
          <TooltipMark label={formatMessage(messages.repliedMark)}>
            <Icon name="message-square-16" className={styles.markIcon} />
          </TooltipMark>
        )}
        {showsMark('imported') && wasImported && (
          <TooltipMark label={formatMessage(messages.sourceImported)}>
            <Icon name="download-16" className={styles.markIcon} />
          </TooltipMark>
        )}
      </Cell>
      {columns
        .filter((column) => !COLUMNS[column].mark)
        .map((column) => (
          <IdeaCell
            key={column}
            column={column}
            idea={idea}
            status={status}
            tagLabels={tagLabels}
            leadingVoteCount={leadingVoteCount}
          />
        ))}
    </Row>
  );
};

export default IdeaRow;
