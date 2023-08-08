import React from 'react';

// i18n
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

// components
import Title from 'components/PostShowComponents/Title';
import { Box } from '@citizenlab/cl2-component-library';
import IdeaMoreActions from './IdeaMoreActions';

// styling
import styled from 'styled-components';
import { isRtl, media } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IIdea } from 'api/ideas/types';

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
  showActions: boolean;
}

const IdeaTitle = ({
  idea,
  projectId,
  translateButtonClicked,
  showActions,
}: Props) => {
  const locale = useLocale();
  const localize = useLocalize();
  if (isNilOrError(locale)) return null;

  const ideaTitle = localize(idea.data.attributes.title_multiloc);

  return (
    <IdeaHeader>
      <Title
        postType="idea"
        postId={idea.data.id}
        title={ideaTitle}
        locale={locale}
        translateButtonClicked={translateButtonClicked}
      />
      {showActions && (
        <Box ml="30px">
          {' '}
          <IdeaMoreActions idea={idea.data} projectId={projectId} />
        </Box>
      )}
    </IdeaHeader>
  );
};

export default IdeaTitle;
