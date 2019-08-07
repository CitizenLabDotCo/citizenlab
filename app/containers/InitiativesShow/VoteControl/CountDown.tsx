import React, { PureComponent } from 'react';
import moment, { Duration } from 'moment';
import { padStart } from 'lodash-es';

import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div`
  display: flex;
`;

const TimeComponent = styled.div`
  margin: 0 5px 0 0;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 30px;
  border-radius: 5px;
  background-color: ${colors.lightGreyishBlue};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
  color: ${props => props.theme.colorText};
`;

const Unit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0 0 0;
  color: ${props => props.theme.colorText};
  font-size: ${fontSizes.small}px;
`;

interface InputProps {
  targetTime: string;
  className?: string;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {
  duration: Duration;
}

class CountDown extends PureComponent<Props, State> {

  interval: number;

  constructor(props) {
    super(props);
    this.state = {
      duration: this.calculateDuration(),
    };
  }
   componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ duration: this.calculateDuration() });
    }, 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  calculateDuration = () => {
    return moment.duration(moment(this.props.targetTime).diff(moment()));
  }

  daysLeft = (): string => {
    return padStart(this.state.duration.days().toString(), 2, '0');
  }

  hoursLeft = (): string  => {
    return padStart(this.state.duration.hours().toString(), 2, '0');
  }

  minutesLeft = (): string  => {
    return padStart(this.state.duration.minutes().toString(), 2, '0');
  }

  render() {
    return (
      <Container className={this.props.className}>
        <TimeComponent>
          <Count>{this.daysLeft()}</Count>
          <Unit><FormattedMessage {...messages.days} /></Unit>
        </TimeComponent>
        <TimeComponent>
          <Count>{this.hoursLeft()}</Count>
          <Unit><FormattedMessage {...messages.hours} /></Unit>
        </TimeComponent>
        <TimeComponent>
          <Count>{this.minutesLeft()}</Count>
          <Unit><FormattedMessage {...messages.minutes} /></Unit>
        </TimeComponent>
      </Container>
    );
  }
}

export default CountDown;
