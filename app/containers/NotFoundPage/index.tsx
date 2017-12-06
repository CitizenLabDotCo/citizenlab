// Libraries
import * as React from 'react';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Components
import ContentContainer from 'components/ContentContainer';
import HelmetIntl from 'components/HelmetIntl';

const TextContainer = styled.div`
  margin: 30px 0;
  padding: 3rem;
  background-color: white;
`;

export default class NotFound extends React.Component {
  render() {
    return (
      <ContentContainer>
        <HelmetIntl
          title={messages.title}
          description={messages.description}
        />
        <TextContainer>
          <h1><FormattedMessage {...messages.header} /></h1>
          <p><FormattedMessage {...messages.text} /></p>
        </TextContainer>
      </ContentContainer>
    );
  }
}
