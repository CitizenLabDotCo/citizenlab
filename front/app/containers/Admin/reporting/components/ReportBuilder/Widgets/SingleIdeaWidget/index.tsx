import React from 'react';

import { useSingleIdea } from 'api/graph_data_units';
import usePhase from 'api/phases/usePhase';

import { isNil } from 'utils/helperUtils';

import Card from '../_shared/Card';
import NoData from '../_shared/NoData';
import { getEmptyMessage } from '../utils';

import IdeaCard from './IdeaCard';
import messages from './messages';
import Settings from './Settings';
import { Props } from './typings';

const SingleIdeaWidget = ({
  projectId,
  phaseId,
  ideaId,
  collapseLongText,
  showAuthor,
  showContent,
  showReactions,
  showVotes,
}: Props) => {
  const { data: response } = useSingleIdea(
    {
      phase_id: phaseId,
      idea_id: ideaId,
    },
    {
      enabled: !!phaseId && !!ideaId,
    }
  );
  const { data } = usePhase(phaseId);
  const phase = data?.data;

  const emptyMessage = getEmptyMessage({ projectId, phaseId });

  const idea = response?.data.attributes.idea;
  const ideaImages = response?.data.attributes.idea_images;

  return (
    <Card>
      {emptyMessage ? (
        <NoData message={emptyMessage} />
      ) : isNil(ideaId) || isNil(idea) || isNil(ideaImages) || isNil(phase) ? (
        <NoData message={messages.noIdeaAvailable} />
      ) : (
        <IdeaCard
          phase={phase}
          idea={idea}
          images={ideaImages}
          collapseLongText={collapseLongText}
          showAuthor={showAuthor}
          showContent={showContent}
          showReactions={showReactions}
          showVotes={showVotes}
        />
      )}
    </Card>
  );
};

SingleIdeaWidget.craft = {
  props: {
    projectId: undefined,
    phaseId: undefined,
    collapseLongText: false,
  },
  related: {
    settings: Settings,
  },
};

export const singleIdeaTitle = messages.singleIdea;

export default SingleIdeaWidget;
