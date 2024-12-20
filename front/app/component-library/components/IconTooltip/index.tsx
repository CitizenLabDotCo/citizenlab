import React, { memo, ReactChild, FC } from 'react';

import { darken } from 'polished';
import styled from 'styled-components';
import { Placement } from 'tippy.js';

import useInstanceId from '../../hooks/useInstanceId';
import { colors } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, {
  BoxPositionProps,
  BoxMarginProps,
  BoxPaddingProps,
  BoxVisibilityProps,
  BoxDisplayProps,
  BoxZIndexProps,
} from '../Box';
import Icon, { IconNames } from '../Icon';
import Tooltip from '../Tooltip';

export const ContentWrapper = styled.div<{ tippytheme: 'light' | undefined }>`
  padding: 5px;
  text-align: left;

  a {
    color: ${(props) =>
      props.tippytheme === 'light' ? colors.primary : colors.white};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${(props) =>
        darken(
          0.15,
          props.tippytheme === 'light' ? colors.primary : colors.white
        )};
      text-decoration: underline;
    }
  }
`;

const TooltipIcon = styled(Icon)<{
  iconColor: string | undefined;
  iconHoverColor: string | undefined;
  iconSize: string | undefined;
  transform: string | undefined;
}>`
  width: ${({ iconSize }) => iconSize};
  height: ${({ iconSize }) => iconSize};
  fill: ${({ iconColor }) => iconColor || colors.textSecondary};
  cursor: pointer;
  ${({ transform }) => (transform ? `transform: ${transform};` : '')}

  &:hover {
    fill: ${({ iconColor, iconHoverColor }) =>
      iconHoverColor ||
      (iconColor ? darken(0.2, iconColor) : darken(0.2, colors.textSecondary))};
  }
`;

export type Props = {
  className?: string;
  content: ReactChild;
  icon?: IconNames;
  placement?: Placement;
  theme?: 'light';
  iconSize?: string;
  iconColor?: string;
  iconHoverColor?: string;
  maxTooltipWidth?: number;
  iconAriaTitle?: string;
  transform?: string;
  role?: string;
} & BoxPositionProps &
  BoxMarginProps &
  BoxPaddingProps &
  BoxVisibilityProps &
  BoxDisplayProps &
  BoxZIndexProps;

const IconTooltip: FC<Props> = memo<Props>(
  ({
    content,
    icon,
    placement,
    theme,
    iconSize = '20px',
    iconColor,
    iconHoverColor,
    maxTooltipWidth,
    iconAriaTitle,
    className,
    transform,
    role,
    ...rest
  }) => {
    const uuid = useInstanceId();

    return (
      <Tooltip
        placement={placement || 'right-end'}
        theme={theme || ''}
        maxWidth={maxTooltipWidth || 350}
        useWrapper={false}
        content={
          <ContentWrapper id={`tooltip-content-${uuid}`} tippytheme={theme}>
            {content}
          </ContentWrapper>
        }
      >
        <Box
          as="button"
          className={`${className || ''} tooltip-icon`}
          aria-describedby={`tooltip-content-${uuid}`}
          data-testid={testEnv('tooltip-icon-button')}
          role={role}
          p="0px"
          type="button"
          display="flex"
          justifyContent="center"
          alignItems="center"
          alignSelf="center"
          {...rest}
        >
          <TooltipIcon
            name={icon || 'info-solid'}
            iconSize={iconSize}
            iconColor={iconColor}
            iconHoverColor={iconHoverColor}
            title={iconAriaTitle}
            transform={transform}
          />
        </Box>
      </Tooltip>
    );
  }
);

export default IconTooltip;
