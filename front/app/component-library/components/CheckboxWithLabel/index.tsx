import React from 'react';

import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Checkbox, { CheckboxProps } from '../Checkbox';
import IconTooltip from '../IconTooltip';

type Props = {
  label: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  id?: string;
  dataTestId?: string;
} & CheckboxProps &
  BoxPaddingProps &
  BoxMarginProps;

const CheckboxWithLabel = ({
  id,
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
      {...boxProps}
    >
      <Checkbox
        id={id || ''}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        checkedColor={checkedColor}
        indeterminate={indeterminate}
        size={size}
        name={name}
        mr="8px"
      />
      <Box as="span" mr="4px">
        {label}
      </Box>
      {labelTooltipText && <IconTooltip content={labelTooltipText} />}
    </Box>
  );
};

export default CheckboxWithLabel;
