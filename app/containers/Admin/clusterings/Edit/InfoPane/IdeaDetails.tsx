import React, { PureComponent } from 'react';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import styled from 'styled-components';
import { fontSize } from 'utils/styleUtils';

type Props = {
  idea: GetIdeaChildProps;
};

const Container = styled.div`
  p {
    font-size: ${fontSize('base')};
  }
`;

class IdeaDetails extends PureComponent<Props> {

  render() {
    const { idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <Container className={this.props['className']}>
        <h1>Selected idea:</h1>
        <h3>
          <T value={idea.attributes.title_multiloc} />
        </h3>
        <T value={idea.attributes.body_multiloc}>
          {(body) => (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          )}
        </T>
      </Container>
    );
  }
}

export default (inputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {(idea) => <IdeaDetails {...inputProps} idea={idea} />}
  </GetIdea>
);
