import React, { PureComponent } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { convertSecondsToDDHHMM } from 'utils/dateUtils';

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
  color: ${(props) => props.theme.colorText};
`;

const Unit = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px 0 0 0;
  color: ${(props) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
`;

interface Props {
  targetTime: string;
  className?: string;
}

interface State {
  refresh: number;
}

class CountDown extends PureComponent<Props, State> {
  interval: NodeJS.Timeout;

  constructor(props) {
    super(props);
    this.state = {
      refresh: Date.now(),
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({ refresh: Date.now() });
    }, 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const start = moment();
    const end = moment(this.props.targetTime, 'YYYY-MM-DDThh:mm:ss.SSSZ');
    const durationAsSeconds = moment.duration(end.diff(start)).asSeconds();
    const formattedDuration = convertSecondsToDDHHMM(durationAsSeconds).split(
      ':'
    );
    const daysLeft = formattedDuration[0];
    const hoursLeft = formattedDuration[1];
    const minutesLeft = formattedDuration[2];

    return (
      <Container className={this.props.className}>
        <TimeComponent>
          <Count>{daysLeft}</Count>
          <Unit>
            <FormattedMessage {...messages.days} />
          </Unit>
        </TimeComponent>
        <TimeComponent>
          <Count>{hoursLeft}</Count>
          <Unit>
            <FormattedMessage {...messages.hours} />
          </Unit>
        </TimeComponent>
        <TimeComponent>
          <Count>{minutesLeft}</Count>
          <Unit>
            <FormattedMessage {...messages.minutes} />
          </Unit>
        </TimeComponent>
      </Container>
    );
  }
}

export default CountDown;
