import React from 'react';

import Icon from 'components/UI/Icon';
import Tooltip from 'components/admin/Tooltip';

// intl
import { FormattedMessage } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typing
interface Props extends OriginalFormattedMessage.Props {
  size?: 'small' | 'big';
  position?: 'left' | 'right' | 'up' | 'down' | 'up-left';
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
`;

const getPxSize = (size: undefined | 'big' | 'small') => {
  return size
    ? (size === 'small' ? '300' : '500')
    : '400';
};

const InfoTooltip = (props: Props) => (
  <Tooltip
    enabled
    content={(
      <TooltipWrapper pxSize={getPxSize(props.size)}>
        <FormattedMessage {...props} />
      </TooltipWrapper>
    )}
    offset={20}
    position={props.position}
  >
    <StyledIcon name="info3" />
  </Tooltip >
);

export default InfoTooltip;
