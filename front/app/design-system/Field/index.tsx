import React, { createContext, ReactNode, useContext } from 'react';

import { FieldErrorContext, Label, Text } from 'react-aria-components';

import { FormattedMessage } from 'utils/cl-intl';

import TooltipMark from '../Tooltip/TooltipMark';

import styles from './Field.module.css';
import FieldError from './FieldError';
import messages from './messages';
import '../tokens.css';

// True inside a setting card, where a field label is 12/16 grey: never bigger
// or darker than the card title.
export const InCardContext = createContext(false);

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
  labelAccessory?: ReactNode;
};

export const FieldLabel = ({
  children,
  tooltip,
  labelAccessory,
}: FieldLabelProps) => {
  const inCard = useContext(InCardContext);

  return (
    <div
      className={
        labelAccessory ? styles.labelRowWithAccessory : styles.labelRow
      }
    >
      <Label className={inCard ? styles.labelInCard : styles.label}>
        {children}
      </Label>
      {labelAccessory}
      {tooltip && <TooltipMark label={tooltip} />}
    </div>
  );
};

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
      <FieldError>{errorMessage}</FieldError>
      {description && !isInvalid && (
        <Text slot="description" className={styles.description}>
          {description}
        </Text>
      )}
    </>
  );
};

export { FieldError, styles as fieldStyles };
