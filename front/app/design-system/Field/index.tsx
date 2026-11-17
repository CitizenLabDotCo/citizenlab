import React, { ReactNode, useContext } from 'react';

import {
  FieldError,
  FieldErrorContext,
  Focusable,
  Label,
  Text,
} from 'react-aria-components';

import { FormattedMessage } from 'utils/cl-intl';

import Icon from '../Icon';
import Tooltip from '../Tooltip';

import styles from './Field.module.css';
import messages from './messages';
import '../tokens.css';

// The grey Required marker: a dot and the word. Never red.
export const RequiredMarker = () => (
  <span className={styles.requiredMarker}>
    <span className={styles.requiredDot} aria-hidden />
    <FormattedMessage {...messages.required} />
  </span>
);

type FieldLabelProps = {
  children: ReactNode;
  // Extra help behind an info icon; it also names the icon for screen readers.
  tooltip?: string;
};

export const FieldLabel = ({ children, tooltip }: FieldLabelProps) => (
  <div className={styles.labelRow}>
    <Label className={styles.label}>{children}</Label>
    {tooltip && (
      <Tooltip content={tooltip}>
        <Focusable>
          <span
            className={styles.infoMark}
            role="img"
            aria-label={tooltip}
            tabIndex={0}
          >
            <Icon name="info-16" />
          </span>
        </Focusable>
      </Tooltip>
    )}
  </div>
);

type FieldHelpProps = {
  description?: ReactNode;
  errorMessage?: ReactNode;
};

// Invalid swaps the description for the error, for screen readers too.
export const FieldHelp = ({ description, errorMessage }: FieldHelpProps) => {
  const validation = useContext(FieldErrorContext);
  const isInvalid = validation?.isInvalid ?? false;

  return (
    <>
      <FieldError className={styles.error}>{errorMessage}</FieldError>
      {description && !isInvalid && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
    </>
  );
};

export { styles as fieldStyles };
