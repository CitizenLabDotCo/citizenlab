import React from 'react';

import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Checkbox, { CheckboxProps } from '../Checkbox';
import IconTooltip from '../IconTooltip';

type Props = {
  label: string | JSX.Element;
  labelTooltipText?: string | JSX.Element | null;
  // This should be used for testing. Only add id prop if there's no other option
  dataTestId?: string;
  ariaLabel?: string;
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
  usePrimaryBorder,
  ariaLabel,
  ...boxProps
}: Props) => {
  const handleLabelClick = (event: React.MouseEvent) => {
    stopLabelPropagation && event.stopPropagation();
  };

  return (
    <Box
      as="label"
      position="relative"
      display="flex"
      flex="1"
      alignItems="center"
      onClick={handleLabelClick}
      data-testid={dataTestId || `${testEnv('check-mark-label')}`}
      style={{ cursor: 'pointer' }}
      {...boxProps}
    >
      <Checkbox
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        checkedColor={checkedColor}
        indeterminate={indeterminate}
        size={size}
        usePrimaryBorder={usePrimaryBorder}
        name={name}
        aria-label={ariaLabel}
        mr="8px"
      />
      {label}
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
