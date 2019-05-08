import * as React from 'react';
import styled from 'styled-components';

// styles
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetSimilarIdeas, { GetSimilarIdeasChildProps } from 'resources/GetSimilarIdeas';

// components
import T from 'components/T';
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

const Container = styled.aside``;

const Title = styled.h3`
  display: flex;
  align-items: center;
  font-size: ${fontSizes.large}px;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 20px;
`;

const SimilarIdeasIcon = styled(Icon)`
  margin-right: 10px;
`;

const IdeaList = styled.ul`
  background-color: ${colors.background};
  padding: 25px;
  margin: 0;
`;

const IdeaListItem = styled.li`
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${colors.label};
  line-height: 1.5em;
  margin-left: 25px;
  font-size: ${fontSizes.small}px;
`;

const IdeaLink = styled(Link)`
  color: ${colors.label};
  text-decoration: none;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  ideas: GetSimilarIdeasChildProps;
}

interface Props extends InputProps, DataProps { }

class SimilarIdeas extends React.Component<Props> {
  onClickIdeaLink = (index: number) => () => {
    trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
  }

  render() {
    const { ideas } = this.props;

    if (isNilOrError(ideas) || isEmpty(ideas)) return null;

    return (
      <Container>
        <Title>
          <SimilarIdeasIcon name="similarIdeas" />
          <FormattedMessage {...messages.similarIdeas} />
        </Title>
        <IdeaList>
          {ideas.map((idea, index) => (
            <IdeaListItem key={idea.id}>
              <IdeaLink
                to={`/ideas/${idea.attributes.slug}`}
                onClick={this.onClickIdeaLink(index)}
              >
                <T value={idea.attributes.title_multiloc} />
              </IdeaLink>
            </IdeaListItem>
          ))}
        </IdeaList>
      </Container>
    );
  }
}

const SimilarIdeasWrapper = (inputProps: InputProps) => (
  <GetSimilarIdeas ideaId={inputProps.ideaId} pageSize={5}>
    {(ideas) => <SimilarIdeas {...inputProps} ideas={ideas} />}
  </GetSimilarIdeas>
);

export default SimilarIdeasWrapper;
