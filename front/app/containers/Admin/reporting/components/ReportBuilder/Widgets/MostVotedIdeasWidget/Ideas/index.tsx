import React from 'react';

// hooks
import useMostreactedIdeas from 'containers/Admin/reporting/hooks/useMostreactedIdeas';

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
  const mostreactedIdeas = useMostreactedIdeas({
    projectId,
    phaseId,
    numberOfIdeas,
  });

  if (isNilOrError(mostreactedIdeas) || mostreactedIdeas.length === 0) {
    return <NoData message={messages.noIdeasAvailable} />;
  }

  return (
    <Box m="16px">
      {mostreactedIdeas.map(
        (
          {
            id,
            attributes: {
              title_multiloc,
              body_multiloc,
              slug,
              likes_count,
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
            likes={likes_count}
            dislikes={dislikes_count}
            comments={comments_count}
            collapseLongText={collapseLongText}
          />
        )
      )}
    </Box>
  );
};

export default Ideas;
