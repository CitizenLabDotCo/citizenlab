import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import messages from '../../messages';

type Props = {
  statusId: string,
  color: string,
  statusName: string,
}

const Container = styled.div`
  padding: 50px 0;
`;

const Title = styled.h4`
  font-size: 18px;
  color: #a6a6a6;
  font-weight: 400;
`;

const Badge = styled.div`
  color: white;
  font-size: 13px;
  border-radius: 3px;
  text-align: center;
  font-weight: bold;
  background-color: ${(props: any) => props.color}
`

export default class Status extends React.Component<Props> {

  render() {
    const { statusId, statusName } = this.props;
    const color = '#29abd0';
    return (
      <Container>
        <Title><FormattedMessage {...messages.ideaStatus} /></Title>
        <Badge color={color} >
          {this.props.statusId}
        </Badge>
      </Container>
    );
  }
}
