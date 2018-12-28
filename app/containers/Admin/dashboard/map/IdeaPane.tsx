import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { isNilOrError } from 'utils/helperUtils';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

import T from 'components/T';

const Container = styled.div`
  padding: 20px;
  width: 100%;
`;

interface DataProps {
  idea: GetIdeaChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaPane extends PureComponent<Props, State> {
  render() {
    const { idea, className } = this.props;

    if (isNilOrError(idea)) return <Container />;

    return (
      <Container className={className}>
        <h4>
          <T value={idea.attributes.title_multiloc} />
        </h4>
        <p>
          <T value={idea.attributes.body_multiloc} supportHtml />
        </p>
      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetIdea id={inputProps.ideaId}>
    {idea => <IdeaPane {...inputProps} idea={idea} />}
  </GetIdea>
);
