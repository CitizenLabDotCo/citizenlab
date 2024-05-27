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
