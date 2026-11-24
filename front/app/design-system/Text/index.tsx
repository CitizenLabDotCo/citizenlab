import React, { AriaRole, ReactNode } from 'react';

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
  as?: 'p' | 'span' | 'div' | 'h2' | 'h3' | 'h4' | 'li';
  variant?: Variant;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  id?: string;
  title?: string;
  role?: AriaRole;
};

const Text = ({
  as: Element = 'p',
  variant = 'body',
  tone = 'primary',
  children,
  className,
  id,
  title,
  role,
}: Props) => (
  <Element
    className={`${typography[variant]} ${styles[tone]} ${className ?? ''}`}
    id={id}
    title={title}
    role={role}
  >
    {children}
  </Element>
);

export default Text;
