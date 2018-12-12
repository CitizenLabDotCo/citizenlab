import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Iframe from 'react-iframe';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  iframe {
    /* border: solid 1px ${colors.separation}; */
    border: none;
  }
`;

type Props = {
  googleFormsUrl: string;
  className?: string;
};

type State = {};

export default class GoogleFormsSurvey extends PureComponent<Props, State> {
  render() {
    const { googleFormsUrl, className } = this.props;

    return (
      <Container className={className}>
        <Iframe
          url={googleFormsUrl}
          width="100%"
          height="542px"
          display="initial"
          position="relative"
          allowFullScreen
        />
      </Container>
    );
  }
}
