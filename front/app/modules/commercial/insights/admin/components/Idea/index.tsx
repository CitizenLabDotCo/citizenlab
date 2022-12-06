import React from 'react';
// hooks
import useIdea from 'hooks/useIdea';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
// components
import T from 'components/T';
// styles
import styled from 'styled-components';

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
  const idea = useIdea({ ideaId });

  if (isNilOrError(idea)) {
    return null;
  }

  return (
    <div data-testid="insightsIdea">
      <IdeaTitle data-testid="insightsIdeaTitle">
        <T value={idea.attributes.title_multiloc} />
      </IdeaTitle>
      <IdeaBody data-testid="insightsIdeaBody">
        <T value={idea.attributes.body_multiloc} supportHtml />
      </IdeaBody>
    </div>
  );
};

export default Idea;
