import React from 'react';
import Button from 'components/UI/Button';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from '..';

interface Props {
  userReacted: StatusComponentProps['userReacted'];
  onCancelReaction: StatusComponentProps['onCancelReaction'];
  onReaction: StatusComponentProps['onReaction'];
  voteButtonId?: string;
  cancelVoteButtonId?: string;
}

const VoteButtons = ({
  userReacted,
  onCancelReaction,
  onReaction,
  voteButtonId,
  cancelVoteButtonId,
}: Props) => {
  return (
    <>
      {userReacted ? (
        <Button
          buttonStyle="success"
          iconSize="20px"
          icon="check"
          onClick={onCancelReaction}
          id={cancelVoteButtonId}
        >
          <FormattedMessage {...messages.voted} />
        </Button>
      ) : (
        <Button
          buttonStyle="primary"
          iconSize="20px"
          icon="vote-ballot"
          onClick={onReaction}
          id={voteButtonId}
        >
          <FormattedMessage {...messages.vote} />
        </Button>
      )}
    </>
  );
};

export default VoteButtons;
