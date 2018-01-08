import * as React from 'react';
import styled from 'styled-components';
import { injectIntl } from 'utils/cl-intl';

const previousIcon = require('../previousIcon.svg');
const nextIcon = require('../nextIcon.svg');

const Container = styled.div`
  display: flex;
  background: #FCFCFC;
  box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`;

const TimeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  padding: 1rem 1.5rem;

  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: #EAEAEA;
`;

const CurrentTime = styled.div`
  color: #6E6E6E;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem;
`;


type Props = {
  value: number,
  onChange: (number) => void,
  interval: 'week' | 'month' | 'year',
  currentTime?: any,
  intl: any,
};

class TimeControl extends React.PureComponent<Props> {

  handlePrevious = () => {
    this.props.onChange(this.props.value - 1);
  }

  handleNext = () => {
    this.props.onChange(this.props.value + 1);
  }

  currentTime() {
    const { currentTime } = this.props;
    if (!currentTime) return;
    const fromTime = currentTime;
    const toTime = fromTime.clone().add(1, `${this.props.interval}s`);
    switch (this.props.interval) {
      case 'week':
        const from = this.props.intl.formatDate(fromTime.toDate(), {
          day: '2-digit',
          weekday: 'short'
        });
        const to = this.props.intl.formatDate(toTime.toDate(), {
          day: '2-digit',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
        });
        return `${from} - ${to}`;
      case 'month':
        return this.props.intl.formatDate(fromTime.toDate(), {
          month: 'long',
          year: 'numeric',
        });
      case 'year':
        return this.props.intl.formatDate(fromTime.toDate(), {
          year: 'numeric',
        });
      default:
        break;
    }
  }

  render() {
    return (
      <Container>
        <TimeButton onClick={this.handlePrevious}>
          <img src={previousIcon} alt="" role="presentation" />
        </TimeButton>
        <Separator />
        <CurrentTime>
          {this.currentTime()}
        </CurrentTime>
        <Separator />
        <TimeButton onClick={this.handleNext}>
          <img src={nextIcon} alt="" role="presentation" />
        </TimeButton>
      </Container>
    );
  }
}

export default injectIntl(TimeControl);
