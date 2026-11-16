import React, { ReactNode } from 'react';

import {
  Button,
  Group,
  Input,
  NumberField as AriaNumberField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import '../tokens.css';
import inputStyles from '../TextField/input.module.css';

import styles from './NumberField.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type NumberFieldProps = LabelProps & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  name?: string;
  id?: string;
  'data-cy'?: string;
};

const NumberField = ({
  label,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  step,
  description,
  errorMessage,
  size = 36,
  isRequired = false,
  isInvalid,
  isDisabled = false,
  name,
  id,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: NumberFieldProps) => (
  <AriaNumberField
    className={inputStyles.field}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    step={step}
    isRequired={isRequired}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    name={name}
    id={id}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && (
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    )}
    <div className={fieldStyles.control}>
      <Group className={`${styles.group} ${inputStyles[`size${size}`]}`}>
        {/* React Aria names the steps and disables them at the minimum and maximum. */}
        <Button slot="decrement" className={styles.step}>
          <Icon name="minus-16" className={styles.stepIcon} />
        </Button>
        <Input className={styles.value} />
        <Button slot="increment" className={styles.step}>
          <Icon name="plus-16" className={styles.stepIcon} />
        </Button>
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaNumberField>
);

export default NumberField;
