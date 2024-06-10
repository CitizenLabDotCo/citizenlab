import React from 'react';

import { colors, Tooltip } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import { StatusComponentProps } from '../../StatusWrapper';

import DisabledReasonTooltip from './DisabledReasonTooltip';

interface Props {
  userReacted: StatusComponentProps['userReacted'];
  onCancelReaction: StatusComponentProps['onCancelReaction'];
  onReaction: StatusComponentProps['onReaction'];
  disabledReason: StatusComponentProps['disabledReason'];
  cancelReactionDisabled: boolean;
}

const VoteButtons = ({
  userReacted,
  onCancelReaction,
  onReaction,
  disabledReason,
  cancelReactionDisabled,
}: Props) => {
  const tippyContent = disabledReason ? (
    <DisabledReasonTooltip disabledReason={disabledReason} />
  ) : null;

  return (
    <>
      {userReacted ? (
        <Button
          iconSize="20px"
          icon="check"
          onClick={onCancelReaction}
          id="e2e-proposal-cancel-vote-button"
          bgColor={colors.success}
          disabled={cancelReactionDisabled}
        >
          <FormattedMessage {...messages.voted} />
        </Button>
      ) : (
        <Tooltip
          disabled={!tippyContent}
          placement="bottom"
          content={tippyContent || <></>}
          theme="light"
          hideOnClick={false}
        >
          <Button
            buttonStyle="primary"
            iconSize="20px"
            icon="vote-ballot"
            onClick={onReaction}
            id="e2e-proposal-vote-button"
          >
            <FormattedMessage {...messages.vote} />
          </Button>
        </Tooltip>
      )}
    </>
  );
};

export default VoteButtons;
