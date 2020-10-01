import React from 'react';

// styles
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// services
import { IMinimalIdeaData } from 'services/ideas';

const IdeaList = styled.ul`
  margin: 0;
  padding: 0;
  padding-left: 17px;
`;

const IdeaListItem = styled.li`
  color: ${(props) => props.theme.colorText};
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
  color: ${(props) => props.theme.colorText};
  text-decoration: underline;

  &:hover {
    color: ${(props) => darken(0.2, props.theme.colorMain)};
    text-decoration: underline;
  }
`;

interface Props {
  similarIdeas: IMinimalIdeaData[];
  className?: string;
}

const SimilarIdeas = ({ similarIdeas, className }: Props) => {
  const onClickIdeaLink = (index: number) => () => {
    trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
  };

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

  return null;
};

export default SimilarIdeas;
