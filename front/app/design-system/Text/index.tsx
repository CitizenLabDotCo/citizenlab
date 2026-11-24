import React, { ReactNode } from 'react';

import typography from '../typography.module.css';

import styles from './Text.module.css';
import '../tokens.css';

type Variant =
  | 'stat'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'bodyLink'
  | 'ui'
  | 'uiStrong'
  | 'uiLink'
  | 'small'
  | 'smallStrong';

type Tone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'body'
  | 'danger'
  | 'disabled'
  | 'inverse'
  | 'placeholder'
  | 'success';

type Props = {
  as?: 'p' | 'span' | 'div';
  variant?: Variant;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
};

const Text = ({
  as: Element = 'p',
  variant = 'body',
  tone = 'primary',
  children,
  className,
  id,
  title,
}: Props) => (
  <Element
    className={`${typography[variant]} ${styles[tone]} ${className ?? ''}`}
    id={id}
    title={title}
  >
    {children}
  </Element>
);

export default Text;
