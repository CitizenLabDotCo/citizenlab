import React, { PureComponent } from 'react';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';
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
  className?: string;
  email: string | null;
  user_id: string | null;
};

type State = {
  loaded: boolean;
};

export default class TypeformSurvey extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  handleIframeOnLoad = () => {
    setTimeout(() => {
      this.setState({ loaded: true });
    }, 100);
  };

  render() {
    const { email, user_id, typeformUrl, className } = this.props;

    const queryString = stringify(omitBy({ email, user_id }, isNil));
    const surveyUrl = `${typeformUrl}?${queryString}`;

    return (
      <Container className={className}>
        <Iframe
          url={surveyUrl}
          width="100%"
          height="500px"
          display={this.state.loaded ? 'block' : 'none'}
          position="relative"
          allowFullScreen
          onLoad={this.handleIframeOnLoad}
        />
      </Container>
    );
  }
}
