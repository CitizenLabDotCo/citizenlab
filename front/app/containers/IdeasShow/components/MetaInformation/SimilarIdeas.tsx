import React from 'react';

import useSimilarIdeas from 'api/ideas/useSimilarIdeas';

import useLocalize from 'hooks/useLocalize';

interface Props {
  ideaId: string;
  className?: string;
}

const SimilarIdeas = ({ ideaId }: Props) => {
  const { data: similarIdeas } = useSimilarIdeas(ideaId);
  const localize = useLocalize();
  if (similarIdeas) {
    const ideasTitles = similarIdeas.data
      .map((similarIdea) => {
        return localize(similarIdea.attributes.title_multiloc);
      })
      .join(', ');
    return <p>{ideasTitles}</p>;
  }
  return null;
};

export default SimilarIdeas;
