import React from 'react';

import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';
import Link, { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';
import styles from './MethodSection.module.css';

// Opens in a new tab so the manager stays where it was. The typed router link
// keeps the route checked; it is styled like a design-system Link.
const FullFormLink = ({ to, params, search }: TypedLinkProps) => {
  const { formatMessage } = useIntl();

  return (
    <Link
      to={to}
      params={params}
      search={search}
      target="_blank"
      rel="noreferrer"
      className={styles.fullFormLink}
    >
      {formatMessage(messages.openFullForm)}
    </Link>
  );
};

export default FullFormLink;
