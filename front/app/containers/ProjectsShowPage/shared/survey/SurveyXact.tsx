import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledIframe = styled.iframe`
  display: block;
  border: none;
  height: 750px;
  flex-basis: 740px;
`;

type Props = {
  surveyXactUrl: string;
  className?: string;
};

export default class SurveyXact extends PureComponent<Props> {
  render() {
    const { surveyXactUrl, className } = this.props;

    return (
      <Container className={className}>
        <StyledIframe src={surveyXactUrl} />
      </Container>
    );
  }
}
