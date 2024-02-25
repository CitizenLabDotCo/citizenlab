import React from 'react';
import Button from 'components/UI/Button';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '../../StatusWrapper';
import Tippy from '@tippyjs/react';
import DisabledReasonTooltip from './DisabledReasonTooltip';

interface Props {
  userReacted: StatusComponentProps['userReacted'];
  onCancelReaction: StatusComponentProps['onCancelReaction'];
  onReaction: StatusComponentProps['onReaction'];
  disabledReason: StatusComponentProps['disabledReason'];
  voteButtonId?: string;
  cancelVoteButtonId?: string;
  cancelReactionDisabled: boolean;
}

const VoteButtons = ({
  userReacted,
  onCancelReaction,
  onReaction,
  disabledReason,
  voteButtonId,
  cancelVoteButtonId,
  cancelReactionDisabled,
}: Props) => {
  const tippyContent = disabledReason ? (
    <DisabledReasonTooltip disabledReason={disabledReason} />
  ) : null;

  return (
    <>
      {userReacted ? (
        <Button
          buttonStyle="success"
          iconSize="20px"
          icon="check"
          onClick={onCancelReaction}
          id={cancelVoteButtonId}
          disabled={cancelReactionDisabled}
        >
          <FormattedMessage {...messages.voted} />
        </Button>
      ) : (
        <Tippy
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
            id={voteButtonId}
          >
            <FormattedMessage {...messages.vote} />
          </Button>
        </Tippy>
      )}
    </>
  );
};

export default VoteButtons;
