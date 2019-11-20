import React, { memo, ReactChild } from 'react';
import Tippy from '@tippy.js/react';

// components
import Icon, { IconNames } from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

const ContentWrapper = styled.div<{ tippytheme: 'light' | undefined }>`
  padding: 5px;

  a {
    color: ${({ tippytheme }) => tippytheme === 'light' ? colors.clBlueDark : colors.clBlueLighter};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${({ tippytheme }) => tippytheme === 'light' ? colors.clBlueDarker : colors.clBlueLight};
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

const TooltipIcon = styled(Icon)<{ iconColor: string | undefined, iconHoverColor: string | undefined }>`
  width: 17px;
  height: 17px;
  cursor: pointer;
  fill: ${({ iconColor }) => iconColor || colors.label};

  &:hover {
    fill: ${({ iconColor, iconHoverColor }) => {
      if (iconHoverColor) {
        return iconHoverColor;
      } else if (iconColor) {
        return darken(0.2, iconColor);
      }

      return darken(0.2, colors.label);
    }};
  }
`;

interface Props {
  content: ReactChild;
  icon?: IconNames;
  placement?: 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start';
  theme?: 'light';
  iconColor?: string;
  iconHoverColor?: string;
  maxTooltipWidth?: number;
}

const IconTooltip = memo<Props>(({ content, icon, placement, theme, iconColor, iconHoverColor, maxTooltipWidth }) => (
  <Tippy
    content={<ContentWrapper id="tooltip-content" tippytheme={theme}>{content}</ContentWrapper>}
    interactive={true}
    placement={placement || 'right-end'}
    theme={theme || ''}
    maxWidth={maxTooltipWidth || 350}
  >
    <TooltipIconButton aria-describedby="tooltip-content" type="button" className="tooltip-icon">
      <TooltipIcon name={icon || 'info3'} iconColor={iconColor} iconHoverColor={iconHoverColor} />
    </TooltipIconButton>
  </Tippy>
));

export default IconTooltip;
