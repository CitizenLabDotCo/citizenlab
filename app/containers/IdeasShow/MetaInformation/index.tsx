import React from 'react';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import { colors, fontSizes } from 'cl2-component-library';

// components
import Status from './Status';
import Location from './Location';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  border-bottom: 1px solid ${colors.separation};
  padding-top: 25px;
  padding-bottom: 30px;
`;

const Header = styled.h3`
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  color: ${(props) => props.theme.colorText};
  margin-bottom: 15px;
`;

const MetaInformation = () => {
  return (
    <Container>
      <Item>
        <Header>
          <FormattedMessage {...messages.currentStatus} />
        </Header>
      </Item>
      <Item>
        <Header>
          <FormattedMessage {...messages.topics} />
        </Header>
      </Item>
      <Item>
        <Header>
          <FormattedMessage {...messages.location} />
        </Header>
        <Location />
      </Item>
      <Item>
        <Header>
          <FormattedMessage {...messages.attachments} />
        </Header>
      </Item>
      <Item>
        <Header>
          <FormattedMessage {...messages.similarIdeas} />
        </Header>
      </Item>
    </Container>
  );
};

export default MetaInformation;
