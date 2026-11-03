import React from 'react';

import useInstanceId from '../../hooks/useInstanceId';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Checkbox, { CheckboxProps } from '../Checkbox';
import IconTooltip from '../IconTooltip';

type Props = {
  label: string | JSX.Element;
  labelTooltipText?: string | JSX.Element | null;
  // This should be used for testing. Only add id prop if there's no other option
  dataTestId?: string;
  id?: string;
  ariaLabel?: string;
  tabIndex?: number;
  dataCy?: string;
} & CheckboxProps &
  BoxPaddingProps &
  BoxMarginProps;

const CheckboxWithLabel = ({
  size,
  disabled,
  indeterminate,
  label,
  stopLabelPropagation,
  checked,
  onChange,
  name,
  checkedColor,
  labelTooltipText,
  dataTestId,
  id,
  usePrimaryBorder,
  required,
  ariaLabel,
  tabIndex,
  dataCy,
  setRef,
  ariaInvalid,
  ariaDescribedBy,
  ...boxProps
}: Props) => {
  const uuid = useInstanceId();
  const inputId = id ?? uuid;

  const handleContainerClick = (event: React.MouseEvent) => {
    stopLabelPropagation && event.stopPropagation();

    // Toggle on clicks in the container's padding too. Clicks on the checkbox
    // or label already toggle it.
    if (!disabled && event.target === event.currentTarget) {
      onChange({
        target: { checked: !checked },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <Box
      position="relative"
      display="flex"
      flex="1"
      alignItems="center"
      onClick={handleContainerClick}
      data-testid={dataTestId || `${testEnv('check-mark-label')}`}
      style={{ cursor: 'pointer' }}
      data-cy={dataCy}
      {...boxProps}
    >
      <Checkbox
        id={inputId}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        checkedColor={checkedColor}
        indeterminate={indeterminate}
        size={size}
        usePrimaryBorder={usePrimaryBorder}
        name={name}
        required={required}
        ariaLabel={ariaLabel}
        tabIndex={tabIndex}
        setRef={setRef}
        ariaInvalid={ariaInvalid}
        ariaDescribedBy={ariaDescribedBy}
        mr="8px"
      />
      <Box
        as="label"
        htmlFor={inputId}
        flex="1"
        aria-hidden={ariaLabel ? true : undefined}
        style={{ cursor: 'pointer' }}
      >
        {label}
      </Box>
      &nbsp;
      {labelTooltipText && (
        <IconTooltip
          display="inline"
          content={labelTooltipText}
          role={ariaLabel ? 'none' : undefined}
          placement="auto"
        />
      )}
    </Box>
  );
};

export default CheckboxWithLabel;
