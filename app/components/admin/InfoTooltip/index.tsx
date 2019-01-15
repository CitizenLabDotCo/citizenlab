import React from 'react';

import Icon from 'components/UI/Icon';
import Tooltip from 'components/UI/Tooltip';

// intl
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typing
import { Message } from 'typings';

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;
const TooltipWrapper = styled.div`
  padding: 15px;
  min-width: 300px;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
`;

const InfoTooltip = (message: Message) => (
  <Tooltip
    enabled
    content={(
      <TooltipWrapper>
        <FormattedMessage {...message} />
      </TooltipWrapper>
    )}
    backgroundColor={colors.adminBackground}
    borderColor={colors.adminTextColor}
    top="33px"
  >
    <StyledIcon name="info" />
  </Tooltip >
);

export default InfoTooltip;
