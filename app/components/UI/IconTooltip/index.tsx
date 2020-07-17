import React, { memo, ReactChild } from 'react';
import Tippy from '@tippyjs/react';

// components
import Icon, { IconNames } from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

const ContentWrapper = styled.div<{ tippytheme: 'light' | undefined }>`
  padding: 5px;

  a {
    color: ${(props) =>
      props.tippytheme === 'light' ? colors.clBlueDark : colors.clBlueLighter};
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
          props.tippytheme === 'light'
            ? colors.clBlueDark
            : colors.clBlueLighter
        )};
      text-decoration: underline;
    }
  }
`;

const TooltipIconButton = styled.button`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  border: none;
`;

const TooltipIcon = styled(Icon)<{
  iconColor: string | undefined;
  iconHoverColor: string | undefined;
  iconSize: string | undefined;
}>`
  width: ${({ iconSize }) => iconSize};
  height: ${({ iconSize }) => iconSize};
  fill: ${({ iconColor }) => iconColor || colors.label};
  cursor: pointer;

  &:hover {
    fill: ${({ iconColor, iconHoverColor }) =>
      iconHoverColor ||
      (iconColor ? darken(0.2, iconColor) : darken(0.2, colors.label))};
  }
`;

export interface Props {
  className?: string;
  content: ReactChild;
  icon?: IconNames;
  placement?:
    | 'auto-start'
    | 'auto'
    | 'auto-end'
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'right-start'
    | 'right'
    | 'right-end'
    | 'bottom-end'
    | 'bottom'
    | 'bottom-start'
    | 'left-end'
    | 'left'
    | 'left-start';
  theme?: 'light';
  iconSize?: string;
  iconColor?: string;
  iconHoverColor?: string;
  maxTooltipWidth?: number;
  iconAriaTitle?: string;
}

const IconTooltip = memo<Props>(
  ({
    content,
    icon,
    placement,
    theme,
    iconSize,
    iconColor,
    iconHoverColor,
    maxTooltipWidth,
    iconAriaTitle,
    className,
  }) => {
    return (
      <Tippy
        interactive={true}
        placement={placement || 'right-end'}
        theme={theme || ''}
        maxWidth={maxTooltipWidth || 350}
        content={
          <ContentWrapper id="tooltip-content" tippytheme={theme}>
            {content}
          </ContentWrapper>
        }
      >
        <TooltipIconButton
          type="button"
          className={`${className || ''} tooltip-icon`}
          aria-describedby="tooltip-content"
        >
          <TooltipIcon
            name={icon || 'info3'}
            iconSize={iconSize || '17px'}
            iconColor={iconColor}
            iconHoverColor={iconHoverColor}
            title={iconAriaTitle}
          />
        </TooltipIconButton>
      </Tippy>
    );
  }
);

export default IconTooltip;
