import React, { memo, ReactChild } from 'react';
import Tippy from '@tippy.js/react';

// components
import Icon, { IconNames } from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

const ContentWrapper = styled.div`
  padding: 5px;

  a {
    color: ${colors.clBlueLight};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${colors.clBlueLighter};
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

const TooltipIcon = styled(Icon)`
  width: 17px;
  height: 17px;
  cursor: pointer;
  fill: ${colors.label};

  &:hover {
    fill: ${darken(0.2, colors.label)};
  }
`;

interface Props {
  content: ReactChild;
  icon?: IconNames;
  placement?: 'auto-start' | 'auto' | 'auto-end' | 'top-start' | 'top' | 'top-end' | 'right-start' | 'right' | 'right-end' | 'bottom-end' | 'bottom' | 'bottom-start' | 'left-end' | 'left' | 'left-start';
  theme?: 'light';
}

const Tooltip = memo<Props>(({ content, icon, placement, theme }) => (
  <Tippy
    content={<ContentWrapper>{content}</ContentWrapper>}
    interactive={true}
    placement={placement || 'right-end'}
    theme={theme}
  >
    <TooltipIconButton type="button" className="tooltip-icon">
      <TooltipIcon name={icon || 'info3'} />
    </TooltipIconButton>
  </Tippy>
));

export default Tooltip;
