import React from 'react';

// hooks
import useMostVotedIdeas from 'containers/Admin/reporting/hooks/useMostVotedIdeas';

// components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaCard from './IdeaCard';

// i18n
import useLocalize from 'hooks/useLocalize';

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

  if (isNilOrError(mostVotedIdeas)) return null;

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
              downvotes_count,
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
            downvotes={downvotes_count}
            comments={comments_count}
            collapseLongText={collapseLongText}
          />
        )
      )}
    </Box>
  );
};

export default Ideas;
