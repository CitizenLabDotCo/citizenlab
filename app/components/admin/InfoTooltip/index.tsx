import React from 'react';

import Icon from 'components/UI/Icon';
import Tooltip from 'components/UI/Tooltip';

// intl
import { FormattedMessage } from 'utils/cl-intl';
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typing
type Props = OriginalFormattedMessage.Props;

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;
const TooltipWrapper = styled.div`
  padding: 15px;
  min-width: 400px;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const InfoTooltip = (props: Props) => (
  <Tooltip
    enabled
    content={(
      <TooltipWrapper>
        <FormattedMessage {...props} />
      </TooltipWrapper>
    )}
    backgroundColor={colors.adminBackground}
    borderColor={colors.adminTextColor}
    top="32px"
  >
    <StyledIcon name="info" />
  </Tooltip >
);

export default InfoTooltip;
