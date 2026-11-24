import React from 'react';

import Badge from 'design-system/Badge';

import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';

import useLocalize from 'hooks/useLocalize';

import styles from './MostLikedRow.module.css';

type Props = {
  statusId: string;
};

const MostLikedStatus = ({ statusId }: Props) => {
  const localize = useLocalize();
  const { data: status } = useIdeaStatus(statusId);

  if (!status) return null;

  return (
    <Badge use="note">
      <span className={styles.status}>
        {localize(status.data.attributes.title_multiloc)}
      </span>
    </Badge>
  );
};

export default MostLikedStatus;
