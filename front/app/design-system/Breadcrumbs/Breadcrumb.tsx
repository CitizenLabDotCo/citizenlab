import React, { ReactNode, useContext } from 'react';

import { Breadcrumb as AriaBreadcrumb, Key, Link } from 'react-aria-components';

import Icon from '../Icon';

import styles from './Breadcrumbs.module.css';
import { SeparatorContext } from './context';
import '../tokens.css';

type Props = {
  // The level's name.
  children: ReactNode;
  id?: Key;
  href?: string;
  isDisabled?: boolean;
};

// The last Breadcrumb in a Breadcrumbs is the current page: not a link, no separator.
const Breadcrumb = ({ children, id, href, isDisabled }: Props) => {
  const separator = useContext(SeparatorContext);

  return (
    <AriaBreadcrumb id={id} className={styles.breadcrumb}>
      {({ isCurrent }) =>
        isCurrent ? (
          <span className={styles.current} aria-current="page">
            {children}
          </span>
        ) : (
          <>
            <Link className={styles.link} href={href} isDisabled={isDisabled}>
              <span className={styles.text}>{children}</span>
            </Link>
            {separator === 'chevron' ? (
              <Icon name="chevron-right-16" className={styles.chevron} />
            ) : (
              <span className={styles.slash} aria-hidden>
                /
              </span>
            )}
          </>
        )
      }
    </AriaBreadcrumb>
  );
};

export default Breadcrumb;
