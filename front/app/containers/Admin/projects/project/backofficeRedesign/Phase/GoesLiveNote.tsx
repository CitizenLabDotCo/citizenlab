import React from 'react';

import Banner from 'design-system/Banner';
import Link from 'design-system/Link';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import styles from './GoesLiveNote.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  project: IProjectData;
}

const GoesLiveNote = ({ project }: Props) => {
  const { formatMessage } = useIntl();

  if (project.attributes.publication_status !== 'draft') return null;

  return (
    <div className={styles.note}>
      <Banner tone="info">
        {formatMessage(messages.goesLiveWithProject)}{' '}
        <Link href={`/admin/projects/${project.id}`}>
          {formatMessage(messages.goToProject)}
        </Link>
      </Banner>
    </div>
  );
};

export default GoesLiveNote;
