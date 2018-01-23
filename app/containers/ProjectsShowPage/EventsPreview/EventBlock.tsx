// Libraries
import * as React from 'react';
import * as moment from 'moment';

// Services
import { IEventData } from 'services/events';

// Components
import T from 'components/T';
import { FormattedDate, FormattedTime } from 'react-intl';
import { Icon } from 'semantic-ui-react';

// Styling
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const Container = styled.div`
  align-items: flex-start;
  background: white;
  border-radius: 5px;
  border: ${color('separation')};
  display: flex;
  padding: 1rem 0.5rem;
  margin: .5rem;
`;

const Date = styled.div`
  align-items: stretch;
  background: #F64A00;
  border-radius: 5px;
  color: white;
  display: flex;
  flex-direction: column;
  flex: 0;
  margin-right: 1rem;
  padding-top: 1.5rem;

  > span {
    padding: 0 1.5rem;
    font-size: ${fontSize('large')};
  }
`;

const Year = styled.p`
  background: #373737;
  border-radius: 0 0 5px 5px;
  margin-top: 1.5rem;
  padding: .25rem 1.5rem;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Time = styled.p`
  color: ${color('label')};
  font-size: ${fontSize('small')};
`;

const Title = styled.p`
  color: ${color('text')};
  font-size: ${fontSize('base')};
`;

const Location = styled.p`
  color: ${color('label')};
  font-size: ${fontSize('small')};
`;


// Typing
interface Props {
  event: IEventData;
  className?: string;
}

interface State {
  separateDates: boolean;
}

export default class EventBlock extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      separateDates: !moment(props.event.attributes.start_at).isSame(props.event.attributes.end_at, 'day'),
    };
  }

  render() {
    return (
      <Container className={this.props.className}>
        <Date>
          <FormattedDate day="2-digit" value={this.props.event.attributes.start_at} />
          <FormattedDate month="short" value={this.props.event.attributes.start_at} />
          {this.state.separateDates &&
            <React.Fragment>
              <span>-</span>
              <FormattedDate day="2-digit" value={this.props.event.attributes.end_at} />
              <FormattedDate month="short" value={this.props.event.attributes.end_at} />
            </React.Fragment>
          }
          <Year><FormattedDate year="numeric" value={this.props.event.attributes.start_at} /></Year>
        </Date>
        <TextBlock>
          <Time><FormattedTime value={this.props.event.attributes.start_at} /> - <FormattedTime value={this.props.event.attributes.end_at} /></Time>
          <Title><T value={this.props.event.attributes.title_multiloc} /></Title>
          <Location><Icon name="marker" /><T value={this.props.event.attributes.location_multiloc} /></Location>
        </TextBlock>
      </Container>
    );
  }
}
