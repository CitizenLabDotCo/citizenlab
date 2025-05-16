import React from 'react';

import { Box, isRtl, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdea } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import Title from 'components/PostShowComponents/Title';

import IdeaMoreActions from './IdeaMoreActions';

const IdeaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -5px;
  margin-bottom: 25px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-top: 0px;
  `}
`;

interface Props {
  idea: IIdea;
  projectId: string;
  translateButtonClicked: boolean;
}

const IdeaTitle = ({ idea, projectId, translateButtonClicked }: Props) => {
  const localize = useLocalize();

  const ideaTitle = localize(idea.data.attributes.title_multiloc);

  return (
    <IdeaHeader>
      <div aria-live="polite">
        {ideaTitle && (
          <Title
            postId={idea.data.id}
            title={ideaTitle}
            translateButtonClicked={translateButtonClicked}
          />
        )}
      </div>
      <Box ml="30px">
        <IdeaMoreActions idea={idea.data} projectId={projectId} />
      </Box>
    </IdeaHeader>
  );
};

export default IdeaTitle;
