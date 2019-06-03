import React, { memo, useCallback, useMemo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

interface InputProps {
  ideaId: string | null;
  close: () => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaPageFullscreenModal = memo<Props>(({ ideaId, close, idea }) => {

  const onClose = useCallback(() => {
    close();
  }, []);

  const url = (!isNilOrError(idea) ? `/ideas/${idea.attributes.slug}` : null);

  const topBar = useMemo(() => {
    return (ideaId ? <IdeaShowPageTopBar ideaId={ideaId} insideModal={true} /> : null);
  }, [ideaId]);

  const content = useMemo(() => {
    return (ideaId ? <IdeasShow ideaId={ideaId} inModal={true} /> : null);
  }, [ideaId]);

  return (
    <FullscreenModal
      opened={ideaId !== null}
      close={onClose}
      url={url}
      topBar={topBar}
    >
      {content}
    </FullscreenModal>
  );
});

export default (inputProps: InputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {idea => <IdeaPageFullscreenModal {...inputProps} idea={idea} />}
  </GetIdea>
);
