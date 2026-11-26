import React, { ReactNode } from 'react';

import Link from 'utils/cl-router/Link';

import styles from './StatCardLink.module.css';

interface Props {
  projectId: string;
  children: ReactNode;
}

// Both stat cards open the project's audience page.
const StatCardLink = ({ projectId, children }: Props) => (
  <Link
    to="/admin/projects/$projectId/audience"
    params={{ projectId }}
    className={styles.link}
  >
    {children}
  </Link>
);

export default StatCardLink;
