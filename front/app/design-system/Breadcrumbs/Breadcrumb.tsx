import React, { ReactNode, useContext } from 'react';

import { Breadcrumb as AriaBreadcrumb, Key, Link } from 'react-aria-components';

import Icon from '../Icon';
import '../tokens.css';

import styles from './Breadcrumbs.module.css';
import { BreadcrumbSeparator, SeparatorContext } from './context';

export type BreadcrumbProps = {
  // The level's name.
  children: ReactNode;
  id?: Key;
  href?: string;
  isDisabled?: boolean;
  // Defaults to the separator of the surrounding Breadcrumbs.
  separator?: BreadcrumbSeparator;
};

// The last Breadcrumb in a Breadcrumbs is the current page: not a link, no separator.
const Breadcrumb = ({
  children,
  id,
  href,
  isDisabled,
  separator,
}: BreadcrumbProps) => {
  const contextSeparator = useContext(SeparatorContext);
  const shownSeparator = separator ?? contextSeparator;

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
            {shownSeparator === 'chevron' ? (
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
