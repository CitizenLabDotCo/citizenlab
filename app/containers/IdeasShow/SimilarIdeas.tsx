import React, { PureComponent } from 'react';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetSimilarIdeas, {
  GetSimilarIdeasChildProps,
} from 'resources/GetSimilarIdeas';

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

const Title = styled.h3`
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  color: ${({ theme }) => theme.colorText};
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-bottom: 18px;
`;

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

interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  ideas: GetSimilarIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

class SimilarIdeas extends PureComponent<Props> {
  onClickIdeaLink = (index: number) => () => {
    trackEventByName(tracks.clickSimilarIdeaLink.name, { extra: { index } });
  };

  render() {
    const { ideas, className } = this.props;

    if (isNilOrError(ideas) || isEmpty(ideas)) return null;

    return (
      <Container className={className}>
        <Title>
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
