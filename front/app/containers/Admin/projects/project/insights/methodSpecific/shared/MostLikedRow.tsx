import React from 'react';

import Icon from 'design-system/Icon';

import { IIdeaData } from 'api/ideas/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { timeAgo } from 'utils/dateUtils';

import styles from './MostLikedRow.module.css';
import MostLikedStatus from './MostLikedStatus';

type Props = {
  idea: IIdeaData;
  showDislikes: boolean;
};

const MostLikedRow = ({ idea, showDislikes }: Props) => {
  const localize = useLocalize();
  const locale = useLocale();
  const { attributes, relationships } = idea;
  const statusId = relationships.idea_status.data?.id;

  const byline = [
    attributes.author_name,
    attributes.published_at
      ? timeAgo(Date.parse(attributes.published_at), locale)
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className={styles.row}>
      <div className={styles.body}>
        <p className={styles.title}>{localize(attributes.title_multiloc)}</p>
        {byline && <p className={styles.byline}>{byline}</p>}
        <div className={styles.counts}>
          <span className={styles.count}>
            <Icon name="arrow-up-16" />
            {attributes.likes_count}
          </span>
          {showDislikes && (
            <span className={styles.count}>
              <Icon name="arrow-down-16" />
              {attributes.dislikes_count}
            </span>
          )}
          <span className={styles.count}>
            <Icon name="message-square-16" />
            {attributes.comments_count}
          </span>
        </div>
      </div>
      {statusId && <MostLikedStatus statusId={statusId} />}
    </li>
  );
};

export default MostLikedRow;
