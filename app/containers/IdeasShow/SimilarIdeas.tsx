import * as React from 'react';
import styled from 'styled-components';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

import GetSimilarIdeas, { GetSimilarIdeasChildProps } from 'resources/GetSimilarIdeas';

import { colors, fontSizes } from 'utils/styleUtils';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

const Container = styled.aside`
  margin-top: 40px;
`;

const Title = styled.h4`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0 0 15px 0;
  padding: 0;
`;

const Table = styled.div``;

const Row = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${colors.label};
  line-height: 1.5em;
`;

const IdeaLink = styled(Link)`
  color: ${colors.label};
  font-weight: 300;
  text-decoration: none;

  &:hover {
    color: ${colors.clBlueDark};
    text-decoration: underline;
  }
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  ideas: GetSimilarIdeasChildProps;
}

interface Props extends InputProps, DataProps {}

class SimilarIdeas extends React.Component<Props> {

  render() {
    const { ideas } = this.props;

    if (isNilOrError(ideas) || isEmpty(ideas)) return null;

    return (
      <Container>
        <Title><FormattedMessage {...messages.similarIdeas} /></Title>
        <Table>
          {ideas.map(idea => (
            <Row key={idea.id}>
              <IdeaLink
                to={`/ideas/${idea.attributes.slug}`}
              >
                <T value={idea.attributes.title_multiloc} />
              </IdeaLink>
            </Row>
          ))}
        </Table>
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
