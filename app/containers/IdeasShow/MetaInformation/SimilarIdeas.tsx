import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// hooks
import useSimilarIdeas from 'hooks/useSimilarIdeas';

const IdeaList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 17px;
`;

const IdeaListItem = styled.li`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const IdeaLink = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

interface Props {
  className?: string;
  ideaId: string;
}

const SimilarIdeas = memo<Props>(({ className, ideaId }) => {
  const similarIdeas = useSimilarIdeas({ ideaId, pageSize: 5 });
  const onClickIdeaLink = (index: number) => () => {
    trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
  };

  if (!isNilOrError(similarIdeas) && similarIdeas.length > 0) {
    return (
      <IdeaList className={className}>
        {similarIdeas.map((similarIdea, index) => (
          <IdeaListItem key={similarIdea.id}>
            <IdeaLink
              to={`/ideas/${similarIdea.attributes.slug}`}
              onClick={onClickIdeaLink(index)}
            >
              <T value={similarIdea.attributes.title_multiloc} />
            </IdeaLink>
          </IdeaListItem>
        ))}
      </IdeaList>
    );
  }

  return null;
});

export default SimilarIdeas;
