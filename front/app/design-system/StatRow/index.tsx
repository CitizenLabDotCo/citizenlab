import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Link as AriaLink,
  PressEvent,
} from 'react-aria-components';

import Icon from '../Icon';
import NewDot from '../NewDot';
import '../tokens.css';

import styles from './StatRow.module.css';

// Pressable rows open the matching filtered list: a link with href, a button with onPress.
// A button row can be a toggle: isPressed sets aria-pressed and draws it as a picked row.
type PressableProps =
  | { href: string; onPress?: undefined; isPressed?: undefined }
  | {
      href?: undefined;
      onPress: (e: PressEvent) => void;
      isPressed?: boolean;
    }
  | { href?: undefined; onPress?: undefined; isPressed?: undefined };

export type StatRowProps = PressableProps & {
  label: ReactNode;
  value: ReactNode;
  // The red notification dot after the label.
  isNew?: boolean;
  'data-cy'?: string;
};

const StatRow = ({
  label,
  value,
  isNew = false,
  href,
  onPress,
  isPressed,
  'data-cy': dataCy,
}: StatRowProps) => {
  const isPressable = href !== undefined || onPress !== undefined;

  const content = (
    <>
      <span className={styles.label}>
        <span className={styles.labelText}>{label}</span>
        {isNew && <NewDot />}
      </span>
      <span className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {isPressable && (
          <Icon name="chevron-right-16" className={styles.chevron} />
        )}
      </span>
    </>
  );

  const className = `${styles.statRow} ${isPressable ? styles.pressable : ''}`;

  if (href !== undefined) {
    return (
      <AriaLink className={className} href={href} data-cy={dataCy}>
        {content}
      </AriaLink>
    );
  }

  if (onPress) {
    return (
      <AriaButton
        className={className}
        onPress={onPress}
        aria-pressed={isPressed}
        data-cy={dataCy}
      >
        {content}
      </AriaButton>
    );
  }

  return (
    <div className={className} data-cy={dataCy}>
      {content}
    </div>
  );
};

export default StatRow;
