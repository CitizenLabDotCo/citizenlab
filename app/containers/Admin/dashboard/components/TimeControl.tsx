import * as React from 'react';
import styled from 'styled-components';

import messages from '../messages';

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
}

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

    switch (this.props.interval) {
      case 'week':
        return currentTime.format("w Y");
      case 'month':
        return currentTime.format("MMM Y");
      case 'year':
        return currentTime.format("Y");
      default:
        break;
    }
  }

  render() {
    return (
      <Container>
        <TimeButton onClick={this.handlePrevious}>
          <img src={previousIcon} />
        </TimeButton>
        <Separator />
        <CurrentTime>
          {this.currentTime()}
        </CurrentTime>
        <Separator />
        <TimeButton onClick={this.handleNext}>
          <img src={nextIcon} />
        </TimeButton>
      </Container>
    );
  }
}

export default TimeControl;
