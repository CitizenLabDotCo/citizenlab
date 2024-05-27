import React from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import { InitiativeDisabledReason } from 'api/initiative_action_descriptors/types';

import globalMessages from 'utils/actionDescriptors/messages';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a,
  button {
    color: ${colors.teal};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.teal)};
      text-decoration: underline;
    }
  }
`;

interface Props {
  disabledReason: InitiativeDisabledReason;
}

const disabledMessages: {
  [key in InitiativeDisabledReason]: MessageDescriptor | undefined;
} = {
  user_not_permitted: messages.votingNotPermitted,
  user_not_in_group: globalMessages.defaultNotInGroup,
  user_blocked: messages.votingNotPermitted,
  user_not_signed_in: undefined,
  user_not_active: undefined,
  user_not_verified: undefined,
  user_missing_requirements: undefined,
};

const DisabledReasonTooltip = ({ disabledReason }: Props) => {
  return (
    <TooltipContent id="tooltip-content" className="e2e-disabled-tooltip">
      <TooltipContentIcon name="lock" ariaHidden />
      <TooltipContentText>
        <FormattedMessage {...disabledMessages[disabledReason]} />
      </TooltipContentText>
    </TooltipContent>
  );
};

export default DisabledReasonTooltip;
