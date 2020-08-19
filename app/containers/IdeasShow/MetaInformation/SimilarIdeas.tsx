import React from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// hooks
import useSimilarIdeas from 'hooks/useSimilarIdeas';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const Container = styled.aside``;

const IdeaList = styled.ul`
  background-color: ${colors.background};
  padding: 25px;
  margin: 0;
`;

const IdeaListItem = styled.li`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-left: 25px;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0px;
  }
`;

const IdeaLink = styled(Link)`
  color: ${colors.label};
  text-decoration: none;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

interface Props {
  ideaId: string;
  className?: string;
}

const SimilarIdeas = ({ ideaId, className }: Props) => {
  const onClickIdeaLink = (index: number) => () => {
    trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
  };

  if (!isNilOrError(ideas) && !isEmpty(ideas)) {
    return (
      <Container className={className}>
        <IdeaList>
          {ideas.map((idea, index) => (
            <IdeaListItem key={idea.id}>
              <IdeaLink
                to={`/ideas/${idea.attributes.slug}`}
                onClick={onClickIdeaLink(index)}
              >
                <T value={idea.attributes.title_multiloc} />
              </IdeaLink>
            </IdeaListItem>
          ))}
        </IdeaList>
      </Container>
    );
  }

  return null;
}

export default SimilarIdeas;
