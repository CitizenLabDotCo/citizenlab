import React, { PureComponent } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledIframe = styled.iframe`
  display: block;
  border: none;
  height: 600px;
  flex-basis: 640px;
`;

type Props = {
  googleFormsUrl: string;
  className?: string;
};

export default class GoogleFormsSurvey extends PureComponent<Props> {
  render() {
    const { googleFormsUrl, className } = this.props;

    return (
      <Container className={className}>
        <StyledIframe src={googleFormsUrl} />
      </Container>
    );
  }
}
