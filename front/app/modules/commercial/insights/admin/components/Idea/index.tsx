import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

type IdeaProps = {
  ideaId: string;
};

const IdeaTitle = styled.h2`
  color: ${colors.primary};
  font-size: ${fontSizes.xl}px;
  margin-top: 16px;
  margin-bottom: 24px;
`;

const IdeaBody = styled.div`
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  padding-bottom: 24px;
`;

const Idea = ({ ideaId }: IdeaProps) => {
  const { data: idea } = useIdeaById(ideaId);

  if (isNilOrError(idea)) {
    return null;
  }

  return (
    <div data-testid="insightsIdea">
      <IdeaTitle data-testid="insightsIdeaTitle">
        <T value={idea.data.attributes.title_multiloc} />
      </IdeaTitle>
      <IdeaBody data-testid="insightsIdeaBody">
        <T value={idea.data.attributes.body_multiloc} supportHtml />
      </IdeaBody>
    </div>
  );
};

export default Idea;
