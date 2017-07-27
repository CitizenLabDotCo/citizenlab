import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from '../../messages';

type Props = {
};

const Container = styled.div`
  padding: 10px 0;
`;

const TextLine = styled.div`
  display: flex;

`;

const Text = styled.div`
  color: #9b9b9b;
  font-size: 16px;
  flex-grow: 1;
`;

const Icon = styled.div`
  flex: 0 0 20px;
`;

const Separator = styled.div`
  border: solid #fafafa 1px;
  background: #eaeaea;
  width: 100%;
  height: 3px;
  margin: 10px 0;
`

export default class SharingLine extends React.Component<Props> {
  render() {
    return (
      <Container>
        <TextLine>
          <Text>
            <FormattedMessage {...messages.shareCTA}/>
          </Text>
          <Icon>
            T
          </Icon>
        </TextLine>
        <Separator />
      </Container>
    );
  }
}

