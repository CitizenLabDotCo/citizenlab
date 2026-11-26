import React, { ReactNode } from 'react';

import { Link as AriaLink } from 'react-aria-components';

import styles from './Link.module.css';
import '../tokens.css';

type LinkProps = {
  children: ReactNode;
  href: string;
  target?: '_blank';
  rel?: string;
};

// Sits inside a paragraph.
const Link = ({ children, href, target, rel }: LinkProps) => (
  <AriaLink className={styles.link} href={href} target={target} rel={rel}>
    {children}
  </AriaLink>
);

export default Link;
