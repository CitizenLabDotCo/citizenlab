import React from 'react';

import styled from 'styled-components';

import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Checkbox, { CheckboxProps } from '../Checkbox';
import IconTooltip from '../IconTooltip';

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};
`;

type Props = {
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
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
  const hasLabel = !!label;

  const handleLabelClick = (event: React.MouseEvent) => {
    stopLabelPropagation && event.stopPropagation();
  };

  return label ? (
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
      <CheckboxContainer hasLabel={hasLabel}>
        <Checkbox
          id={id || ''}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          checkedColor={checkedColor}
          indeterminate={indeterminate}
          size={size}
          name={name}
        />
      </CheckboxContainer>
      <Box as="span" mr="4px">
        {label}
      </Box>
      {labelTooltipText && <IconTooltip content={labelTooltipText} />}
    </Box>
  ) : (
    <Checkbox
      id={id || ''}
      onChange={onChange}
      checked={checked}
      disabled={disabled}
      checkedColor={checkedColor}
      indeterminate={indeterminate}
      size={size}
      name={name}
      {...boxProps}
    />
  );
};

export default CheckboxWithLabel;
