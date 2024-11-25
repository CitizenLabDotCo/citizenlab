import React from 'react';

import useSimilarIdeas from 'api/ideas/useSimilarIdeas';

import useLocalize from 'hooks/useLocalize';

interface Props {
  ideaId: string;
  className?: string;
}

const SimilarIdeas = ({ ideaId, className }: Props) => {
  const { data: similarIdeas } = useSimilarIdeas(ideaId);
  const localize = useLocalize();
  console.log(similarIdeas);
  if (similarIdeas) {
    const ideasTitles = similarIdeas.data
      .map((similarIdea) => {
        // const ideasTitles = ideas?.map((idea) => idea.attributes.title_multiloc['en-GB']).join(', ');
        return localize(similarIdea.attributes.title_multiloc);
      })
      .join(', ');
    console.log(ideasTitles);
    return <p>{ideasTitles}</p>;
  }
  return null;
};

export default SimilarIdeas;
