import React from 'react';

import styled from 'styled-components';

import { Color } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Checkbox from '../Checkbox';
import IconTooltip from '../IconTooltip';

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};
`;

type DefaultProps = {
  size?: string;
  disabled?: boolean;
  indeterminate?: boolean;
};

type Props = DefaultProps &
  BoxPaddingProps &
  BoxMarginProps & {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    label?: string | JSX.Element | null;
    labelTooltipText?: string | JSX.Element | null;
    id?: string;
    name?: string;
    stopLabelPropagation?: boolean;
    checkedColor?: Color;
    dataTestId?: string;
  };

const CheckboxWithLabel = ({
  id,
  label,
  labelTooltipText,
  stopLabelPropagation,
  size = '24px',
  checked,
  className,
  disabled = false,
  indeterminate = false,
  onChange,
  name,
  checkedColor,
  dataTestId,
  ...rest
}: Props) => {
  const hasLabel = !!label;

  const handleLabelClick = (event: React.MouseEvent) => {
    stopLabelPropagation && event.stopPropagation();
  };

  const checkedOrIndeterminate = checked || indeterminate;

  return label ? (
    <Box
      as="label"
      className={className || ''}
      position="relative"
      display="flex"
      flex="1"
      alignItems="center"
      onClick={handleLabelClick}
      data-testid={dataTestId || `${testEnv('check-mark-label')}`}
      {...rest}
    >
      <CheckboxContainer hasLabel={hasLabel}>
        <Checkbox
          id={id || ''}
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          checkedColor={checkedColor}
          checkedOrIndeterminate={checkedOrIndeterminate}
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
    <Box
      className={className || ''}
      data-testid={testEnv('check-mark-label')}
      {...rest}
    >
      <Checkbox
        id={id || ''}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        checkedColor={checkedColor}
        checkedOrIndeterminate={checkedOrIndeterminate}
        indeterminate={indeterminate}
        size={size}
        name={name}
      />
    </Box>
  );
};

export default CheckboxWithLabel;
