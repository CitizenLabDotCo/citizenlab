import React, { FC, memo } from 'react';

import styled, { css } from 'styled-components';

import { fontSizes, colors } from '../../utils/styleUtils';
import Box, { BoxHeightProps, BoxMarginProps, BoxWidthProps } from '../Box';
import Icon, { IconProps } from '../Icon';

const Container = styled(Box)<{ backgroundColor: string; variant: Variant }>`
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  line-height: normal;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.backgroundColor};
  padding-left: 10px;
  padding-right: 10px;
  ${({ variant }: { variant: Variant }) => css`
    ${variant === 'default'
      ? `
        color: #fff;
        `
      : ''}
    ${variant === 'outlined'
      ? `
        color: ${colors.textSecondary};
        border: 1px solid ${colors.textSecondary};
        `
      : ''}
  `}
`;

type Variant = 'default' | 'outlined';

type Props = {
  className?: string;
  text: JSX.Element | string;
  backgroundColor: string;
  color?: string;
  icon?: IconProps['name'];
  variant?: Variant;
} & BoxWidthProps &
  BoxHeightProps &
  BoxMarginProps;

const StatusLabel: FC<Props> = memo<Props>(
  ({
    backgroundColor,
    color,
    className,
    icon,
    text,
    variant = 'default',
    height = '28px',
    ...rest
  }) => {
    return (
      <Container
        backgroundColor={backgroundColor}
        className={className || ''}
        variant={variant}
        {...rest}
        height={height}
        color={color}
      >
        {icon && (
          <Icon
            name={icon}
            height="16px"
            marginRight="4px"
            fill={variant === 'outlined' ? colors.textSecondary : '#fff'}
          />
        )}
        {text}
      </Container>
    );
  }
);

export default StatusLabel;
