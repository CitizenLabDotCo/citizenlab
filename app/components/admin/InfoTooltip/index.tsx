import React from 'react';
import { omit } from 'lodash-es';

import Icon from 'components/UI/Icon';
import Tooltip from 'components/admin/Tooltip';

// intl
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typing
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { Omit } from 'typings';

interface Props extends Omit<OriginalFormattedMessage.Props, 'children'> {
  size?: 'small' | 'big';
  position?: 'left' | 'right' | 'up' | 'down' | 'up-left';
  className?: string;
  children?: JSX.Element | null;
  offset?: number;
  openDelay?: number;
}

const StyledIcon = styled(Icon)`
  height: 14px;
  width: 14px;
`;

const TooltipWrapper: any = styled.div`
  padding: 15px;
  min-width: ${(props: any) => props.pxSize}px;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: 18px;
  line-break: break;
  white-space: normal;
  text-align: justify;
`;

const getPxSize = (size: undefined | 'big' | 'small' | 'xs') => {
  if (size === 'big') {
    return 500;
  } else if (size === 'small') {
    return 300;
  } else if (size === 'xs') {
    return 200;
  } else {
    return 400;
  }
};

const InfoTooltip = (props: Props) => {
  const { position, size, className, children, offset, openDelay } = props;
  const pxSize = getPxSize(size);
  const passthroughProps = omit(props, ['size', 'position', 'className', 'children', 'offset']);

  return (
    <Tooltip
      enabled
      content={(
        <TooltipWrapper pxSize={pxSize}>
          <FormattedMessage {...passthroughProps} />
        </TooltipWrapper>
      )}
      offset={offset || 20}
      position={position}
      className={className}
      openDelay={openDelay}
    >
      {children
        ? children
        : <StyledIcon name="info3" />
      }
    </Tooltip >
  );
};

export default InfoTooltip;
