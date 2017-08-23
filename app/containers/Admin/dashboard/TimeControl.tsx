import * as React from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import { FormattedMessage } from 'react-intl';

const previousIcon = require('./previousIcon.svg');
const nextIcon = require('./nextIcon.svg');
import messages from './messages';

const Container = styled.div`
  display: flex;
  background: #FCFCFC;
  box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`;

const TimeButton = styled.button`
  color: #6E6E6E;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 1rem;
  cursor: pointer;
  outline: none;
  padding: 1rem 1.5rem;


  img {
    padding: 0 1rem;
  }

  &:hover {
    color: ${darken(0.1, '#6E6E6E')};
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: #EAEAEA;
`;


type Props = {
  value: number,
  onChange: (number) => void,
  interval: 'day' | 'week' | 'month' | 'year',
}

class TimeControl extends React.PureComponent<Props> {

  handlePrevious = () => {
    this.props.onChange(this.props.value - 1);
  }

  handleNext = () => {
    this.props.onChange(this.props.value + 1);
  }

  render() {
    return (
      <Container>
        <TimeButton onClick={this.handlePrevious}>
          <img src={previousIcon} />
          <FormattedMessage
            {...messages.previousInterval}
            values={{
              interval: this.props.interval
            }}
          />
        </TimeButton>
        <Separator />
        <TimeButton onClick={this.handleNext}>
          <FormattedMessage
            {...messages.nextInterval}
            values={{
              interval: this.props.interval
            }}
          />
          <img src={nextIcon} />
        </TimeButton>
      </Container>
    );
  }
}

export default TimeControl;
