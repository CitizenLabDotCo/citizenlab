import React from 'react';

// hooks
import useMostVotedIdeas from 'containers/Admin/reporting/hooks/useMostVotedIdeas';

// components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaCard from './IdeaCard';
import NoData from '../../_shared/NoData';

// i18n
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId: string;
  phaseId?: string;
  numberOfIdeas: number;
  collapseLongText: boolean;
}

const Ideas = ({
  projectId,
  phaseId,
  numberOfIdeas,
  collapseLongText,
}: Props) => {
  const localize = useLocalize();
  const mostVotedIdeas = useMostVotedIdeas({
    projectId,
    phaseId,
    numberOfIdeas,
  });

  if (isNilOrError(mostVotedIdeas) || mostVotedIdeas.length === 0) {
    return <NoData message={messages.noIdeasAvailable} />;
  }

  return (
    <Box m="16px">
      {mostVotedIdeas.map(
        (
          {
            id,
            attributes: {
              title_multiloc,
              body_multiloc,
              slug,
              upvotes_count,
              dislikes_count,
              comments_count,
            },
          },
          i
        ) => (
          <IdeaCard
            key={i}
            rank={i + 1}
            title={localize(title_multiloc)}
            body={localize(body_multiloc)}
            url={`/ideas/${slug}`}
            id={id}
            upvotes={upvotes_count}
            downvotes={dislikes_count}
            comments={comments_count}
            collapseLongText={collapseLongText}
          />
        )
      )}
    </Box>
  );
};

export default Ideas;
