import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaCard from './IdeaCard';
import NoData from '../../_shared/NoData';

// i18n
import useLocalize from 'hooks/useLocalize';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaData } from 'api/ideas/types';
import { IIdeaImageData } from 'api/idea_images/types';

interface Props {
  ideas: IIdeaData[];
  images: IIdeaImageData[];
  collapseLongText: boolean;
}

const Ideas = ({ ideas, images, collapseLongText }: Props) => {
  const localize = useLocalize();

  if (isNilOrError(ideas) || ideas.length === 0) {
    return <NoData message={messages.noIdeasAvailable} />;
  }

  return (
    <Box>
      {ideas.map(
        (
          {
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
            images={images}
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
