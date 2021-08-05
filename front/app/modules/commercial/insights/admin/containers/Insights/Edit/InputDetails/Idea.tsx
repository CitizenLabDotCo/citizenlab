import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import T from 'components/T';

// hooks
import useIdea from 'hooks/useIdea';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

type IdeaProps = {
  ideaId: string;
};

const IdeaTitle = styled.h2`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  margin-top: 16px;
  margin-bottom: 24px;
`;

const IdeaBody = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  padding-bottom: 24px;
`;

const Idea = ({ ideaId }: IdeaProps) => {
  const idea = useIdea({ ideaId });
  if (isNilOrError(idea)) {
    return null;
  }

  return (
    <>
      <IdeaTitle data-testid="insightsDetailsIdeaTitle">
        <T value={idea.attributes.title_multiloc} />
      </IdeaTitle>
      <IdeaBody data-testid="insightsDetailsIdeaBody">
        <T value={idea.attributes.body_multiloc} supportHtml />
      </IdeaBody>
    </>
  );
};

export default Idea;
