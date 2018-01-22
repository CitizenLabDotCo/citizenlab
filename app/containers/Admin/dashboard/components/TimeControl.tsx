import * as React from 'react';

// components
import Icon from 'components/UI/Icon';

// i18n
import { injectIntl } from 'utils/cl-intl';

// styling
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  background: #fff;
  border-radius: 5px;
  /* box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1); */
`;

const StyledIcon = styled(Icon)`
  height: 15px;
  fill: #999;
`;

const PrevIcon = StyledIcon.extend``;

const NextIcon = StyledIcon.extend`
  transform: rotate(180deg);
`;

const TimeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  padding: 1rem 1.5rem;

  &:hover {
    ${PrevIcon},
    ${NextIcon} {
      fill: #000;
    }
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: #EAEAEA;
`;

const CurrentTime = styled.div`
  min-width: 160px;
  color: #000;
  font-size: 16px;
  text-transform: capitalize;
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
          <NextIcon name="chevron-right" />
        </TimeButton>
        <Separator />
        <CurrentTime>
          {this.currentTime()}
        </CurrentTime>
        <Separator />
        <TimeButton onClick={this.handleNext}>
          <PrevIcon name="chevron-right" />
        </TimeButton>
      </Container>
    );
  }
}

export default injectIntl<Props>(TimeControl);
