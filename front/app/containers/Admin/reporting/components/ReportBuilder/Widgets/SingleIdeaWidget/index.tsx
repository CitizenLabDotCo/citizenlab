import React from 'react';

// components
import Card from '../_shared/Card';
import NoData from '../_shared/NoData';
import Settings from './Settings';
import IdeaCard from './IdeaCard';

// i18n
import messages from './messages';

// typings
import { Props } from './typings';

// hooks
import { getEmptyMessage } from '../utils';
import { useSingleIdea } from 'api/graph_data_units';
import usePhase from 'api/phases/usePhase';

// utils
import { isNil } from 'utils/helperUtils';

const SingleIdeaWidget = ({
  title,
  projectId,
  phaseId,
  ideaId,
  collapseLongText,
  showAuthor,
  showContent,
  showReactions,
  showVotes,
}: Props) => {
  const response = useSingleIdea(
    {
      phaseId,
      ideaId,
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
    <Card title={title}>
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
    title: {},
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
