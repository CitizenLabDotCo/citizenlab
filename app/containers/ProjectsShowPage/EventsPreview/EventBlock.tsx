// Libraries
import * as React from 'react';

// Services
import { IEventData } from 'services/events';

// Components
import T from 'components/T';
import { FormattedDate, FormattedTime } from 'react-intl';

// Styling
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const Container = styled.div`
  background: white;
  border-radius: 5px;
  border: ${color('separation')};
  display: flex;
  padding: 1rem 0.5rem;
`;

const Date = styled.div`
  align-items: stretch;
  background: #F64A00;
  color: white;
  display: flex;
  flex-direction: column;
  flex: 0;
  margin-right: 1rem;
`;

const Year = styled.p``;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Time = styled.p``;

const Title = styled.p``;

const Location = styled.p``;


// Typing
interface Props {
  event: IEventData;
}

interface State {}

export default class EventBlock extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <Container>
        <Date>
          <FormattedDate day="numeric" value={this.props.event.attributes.start_at}  />
          <FormattedDate month="short" value={this.props.event.attributes.start_at} />
          <Year><FormattedDate year="numeric" value={this.props.event.attributes.start_at} /></Year>
        </Date>
        <TextBlock>
          <Time><FormattedTime value={this.props.event.attributes.start_at} /> - <FormattedTime value={this.props.event.attributes.end_at} /></Time>
          <Title><T value={this.props.event.attributes.title_multiloc} /></Title>
          <Location><T value={this.props.event.attributes.location_multiloc} /></Location>
        </TextBlock>
      </Container>
    );
  }
}
