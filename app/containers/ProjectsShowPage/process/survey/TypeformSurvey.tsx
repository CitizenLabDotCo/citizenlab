import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Iframe from 'react-iframe';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  iframe {
    border: solid 1px ${colors.separation};
  }
`;

type Props = {
  typeformUrl: string;
  email: string | null;
  className?: string;
};

type State = {};

export default class TypeformSurvey extends PureComponent<Props, State> {
  render() {
    const { email, typeformUrl, className } = this.props;
    const surveyUrl = (email ? `${typeformUrl}?email=${email}` : typeformUrl);

    return (
      <Container className={className}>
        <Iframe
          url={surveyUrl}
          width="100%"
          height="500px"
          display="block"
          position="relative"
          allowFullScreen
        />
      </Container>
    );
  }
}
