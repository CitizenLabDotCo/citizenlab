import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import Tooltip from 'components/UI/Tooltip';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { Omit } from 'typings';
import { IPosition } from 'components/UI/Popover';

interface Props extends Omit<OriginalFormattedMessage.Props, 'children'> {
  size?: 'small' | 'big';
  className?: string;
  children?: JSX.Element | null;
  offset?: number;
  position?: IPosition;
  iconColor?: string;
}

const Container = styled.div`
  width: 16px;
  height: 16px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;
  padding-right: 10px;
`;

const StyledIcon = styled(Icon)<{ color?: string }>`
  width: 16px;
  height: 16px;
  cursor: pointer;
  fill: ${({ color }) => color ? color : colors.label};

  &:hover {
    fill: ${({ color }) => color ? darken(.2, color) : darken(.2, colors.label)};
  }
`;

const TooltipWrapper = styled.div<{ minWidth: number }>`
  padding: 12px;
  min-width: ${({ minWidth }) => minWidth}px;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  text-align: left;
`;

const getMinWidth = (size: undefined | 'big' | 'small' | 'xs') => {
  if (size === 'big') {
    return 500;
  } else if (size === 'small') {
    return 300;
  } else if (size === 'xs') {
    return 200;
  }

  return 400;
};

const InfoTooltip = memo<Props>((props) => {
  const { position, size, className, children, offset, iconColor, ...passthroughProps } = props;
  const minWidth = getMinWidth(size);

  return (
    <Container className={`${className} infoTooltip`}>
      <Tooltip
        enabled={true}
        content={
          <TooltipWrapper minWidth={minWidth}>
            <FormattedMessage {...passthroughProps} />
          </TooltipWrapper>
        }
        offset={offset || 28}
        position={position}
        className={className}
        backgroundColor={colors.popoverDarkBg}
        borderColor={colors.popoverDarkBg}
      >
        <IconWrapper>
          {children || <StyledIcon name="info3" className="infoTooltipIcon" />}
        </IconWrapper>
      </Tooltip >
    </Container>
  );
});

export default InfoTooltip;
