import React, { PureComponent } from 'react';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

type Props = {
  idea: GetIdeaChildProps;
};

const Container = styled.div`
  p {
    font-size: ${fontSizes.base}px;
  }
`;

class IdeaDetails extends PureComponent<Props> {
  render() {
    const { idea } = this.props;

    if (isNilOrError(idea)) return null;

    return (
      <Container className={this.props['className']}>
        <T value={idea.attributes.body_multiloc} supportHtml />
      </Container>
    );
  }
}

export default (inputProps) => (
  <GetIdea ideaId={inputProps.ideaId}>
    {(idea) => <IdeaDetails {...inputProps} idea={idea} />}
  </GetIdea>
);
