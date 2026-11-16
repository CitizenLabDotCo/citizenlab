import React from 'react';

import { TagGroup, TagList } from 'react-aria-components';

import { Tag } from 'design-system/TagGroup';

import TooltipMark from '../TooltipMark';

import styles from './IdeaTable.module.css';

const VISIBLE_TAGS = 2;

interface Props {
  label: string;
  labels: string[];
}

// The design-system TagGroup always shows its label, which a table cell has in its column head.
const TagChips = ({ label, labels }: Props) => {
  const hidden = labels.slice(VISIBLE_TAGS);

  return (
    <span className={styles.tags}>
      <TagGroup aria-label={label} className={styles.tagGroup}>
        <TagList className={styles.tagList}>
          {labels.slice(0, VISIBLE_TAGS).map((tag) => (
            <Tag key={tag} id={tag}>
              {tag}
            </Tag>
          ))}
        </TagList>
      </TagGroup>
      {hidden.length > 0 && (
        <TooltipMark label={hidden.join(', ')}>
          <span className={styles.more}>{`+${hidden.length}`}</span>
        </TooltipMark>
      )}
    </span>
  );
};

export default TagChips;
