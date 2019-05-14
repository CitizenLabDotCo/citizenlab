import React, { memo, useCallback } from 'react';
import ReactDOM from 'react-dom';

// components
import VoteControl from 'components/VoteControl';
import TopBar from 'components/UI/TopBar';

// utils
import clHistory from 'utils/cl-router/history';

interface Props {
  ideaId: string;
  unauthenticatedVoteClick: () => void;
}

const IdeaVoteControlMobile = memo<Props>(({ ideaId, unauthenticatedVoteClick }) => {

  const onGoBack = useCallback(() => {
    clHistory.push('/');
  }, []);

  const onUnauthenticatedVoteClick = useCallback(() => {
    unauthenticatedVoteClick();
  }, []);

  return ReactDOM.createPortal(
    (
      <TopBar goBack={onGoBack}>
        <VoteControl
          ideaId={ideaId}
          unauthenticatedVoteClick={onUnauthenticatedVoteClick}
          size="1"
        />
      </TopBar>
    ),
    document.body
  );
});

export default IdeaVoteControlMobile;
