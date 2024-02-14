import React from 'react';

// components
import Card from '../_shared/Card';
import NoData from '../_shared/NoData';
import Settings from './Settings';

// i18n
import messages from './messages';

// typings
import { Props } from './typings';

// hooks
import { getEmptyMessage } from '../utils';
import useLocalize from 'hooks/useLocalize';
import IdeaCard from '../MostReactedIdeasWidget/Ideas/IdeaCard';
import { useSingleIdea } from 'api/graph_data_units';
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
  const localize = useLocalize();

  const emptyMessage = getEmptyMessage({ projectId, phaseId });

  const idea = response?.data.attributes.idea.attributes;
  const ideaImages = response?.data.attributes.idea_images;

  return (
    <Card title={title}>
      {emptyMessage ? (
        <NoData message={emptyMessage} />
      ) : isNil(idea) || isNil(ideaImages) ? (
        <NoData message={messages.noIdeaAvailable} />
      ) : (
        <IdeaCard
          title={localize(idea.title_multiloc)}
          body={localize(idea.body_multiloc)}
          url={`/ideas/${idea.slug}`}
          images={ideaImages}
          likes={idea.likes_count}
          dislikes={idea.dislikes_count}
          comments={idea.comments_count}
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
