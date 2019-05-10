import React, { memo, useCallback } from 'react';
import ReactDOM from 'react-dom';

// components
import VoteControl from 'components/VoteControl';
import TopBar from 'components/UI/Fullscreenmodal/TopBar';

interface Props {
  ideaId: string;
  unauthenticatedVoteClick: () => void;
}

const IdeaVoteControlMobile = memo<Props>(({ ideaId, unauthenticatedVoteClick }) => {

  const onGoHome = useCallback(() => {
    console.log('go big or home');
  }, []);

  const onUnauthenticatedVoteClick = useCallback(() => {
    console.log('onUnauthenticatedVoteClick');
    unauthenticatedVoteClick();
  }, []);

  return ReactDOM.createPortal(
    (
      <TopBar goHome={onGoHome}>
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
