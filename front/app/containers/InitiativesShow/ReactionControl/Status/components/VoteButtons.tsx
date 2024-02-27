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
          buttonStyle="success"
          iconSize="20px"
          icon="check"
          onClick={onCancelReaction}
          id="e2e-proposal-cancel-vote-button"
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
            id="e2e-proposal-vote-button"
          >
            <FormattedMessage {...messages.vote} />
          </Button>
        </Tippy>
      )}
    </>
  );
};

export default VoteButtons;
