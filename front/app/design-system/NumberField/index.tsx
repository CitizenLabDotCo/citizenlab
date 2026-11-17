import React, { ReactNode, useContext } from 'react';

import {
  Button,
  Group,
  Input,
  NumberField as AriaNumberField,
  NumberFieldStateContext,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import inputStyles from '../TextField/input.module.css';

import styles from './NumberField.module.css';
import '../tokens.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a heading or the row already names it) it needs an aria-label.
  | { label?: undefined; 'aria-label': string };

type NumberFieldProps = LabelProps & {
  value?: number;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
  isDisabled?: boolean;
  // Names for the step buttons; React Aria's default is "Increase/Decrease <field label>".
  incrementAriaLabel?: string;
  decrementAriaLabel?: string;
  name?: string;
  id?: string;
};

type StepButtonProps = { slot: 'increment' | 'decrement' };

// React Aria disables a step at the minimum and maximum with the native disabled attribute;
// it also marks it aria-disabled so the state reads the same as other disabled controls.
const StepButton = ({ slot }: StepButtonProps) => {
  const state = useContext(NumberFieldStateContext);
  const canStep =
    slot === 'increment' ? state?.canIncrement : state?.canDecrement;

  return (
    <Button
      slot={slot}
      className={styles.step}
      aria-disabled={canStep === false ? true : undefined}
      // Focus stays in the input: a blur before the stepped value renders
      // would commit the old one.
      onMouseDown={(event) => event.preventDefault()}
    >
      <Icon
        name={slot === 'increment' ? 'plus-16' : 'minus-16'}
        className={styles.stepIcon}
      />
    </Button>
  );
};

const NumberField = ({
  label,
  value,
  onChange,
  minValue,
  maxValue,
  step,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  isDisabled = false,
  incrementAriaLabel,
  decrementAriaLabel,
  name,
  id,
  'aria-label': ariaLabel,
}: NumberFieldProps) => (
  <AriaNumberField
    className={inputStyles.field}
    value={value}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    step={step}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    incrementAriaLabel={incrementAriaLabel}
    decrementAriaLabel={decrementAriaLabel}
    name={name}
    id={id}
    aria-label={ariaLabel}
  >
    {label !== undefined && <FieldLabel>{label}</FieldLabel>}
    <div className={fieldStyles.control}>
      <Group className={`${styles.group} ${inputStyles[`size${size}`]}`}>
        {/* React Aria names the steps and disables them at the minimum and maximum. */}
        <StepButton slot="decrement" />
        <Input className={styles.value} />
        <StepButton slot="increment" />
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaNumberField>
);

export default NumberField;
