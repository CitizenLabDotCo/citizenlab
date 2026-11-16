import React, { ReactNode } from 'react';

import { Link as AriaLink } from 'react-aria-components';

import '../tokens.css';

import styles from './Link.module.css';

export type LinkVariant = 'inline' | 'standalone';

export type LinkProps = {
  children: ReactNode;
  href: string;
  // Inline sits inside a paragraph; Standalone stands on its own line.
  variant?: LinkVariant;
  target?: '_blank' | '_self';
  rel?: string;
  isDisabled?: boolean;
  'data-cy'?: string;
};

const Link = ({
  children,
  href,
  variant = 'inline',
  target,
  rel,
  isDisabled = false,
  'data-cy': dataCy,
}: LinkProps) => (
  <AriaLink
    className={`${styles.link} ${styles[variant]}`}
    href={href}
    target={target}
    rel={rel}
    isDisabled={isDisabled}
    data-cy={dataCy}
  >
    {children}
  </AriaLink>
);

export default Link;
