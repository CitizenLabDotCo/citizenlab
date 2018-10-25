// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import {
  chartTheme,
  Container,
  GraphsContainer,
  Line,
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
  ControlBar
} from '../';
import TimeControl from '../components/TimeControl';
import IntervalControl from '../components/IntervalControl';
import GenderChart from '../components/GenderChart';
import AgeChart from '../components/AgeChart';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentGroupFilter?: string;
}

type Props = {

};

export default class UsersDashboard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentGroupFilter: undefined
    };
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  handleOnGroupFilter = (filter) => {
    // To be implemented
    this.setState({ currentGroupFilter: filter });
  }

  render() {
    const { interval, intervalIndex, currentGroupFilter } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();

    return (
      <Container>
        <ControlBar>
          <TimeControl
            value={intervalIndex}
            interval={interval}
            onChange={this.changeIntervalIndex}
            currentTime={startAtMoment}
          />
          <IntervalControl
            value={interval}
            onChange={this.changeInterval}
          />
        </ControlBar>
        <ThemeProvider theme={chartTheme}>
          <GraphsContainer>
            <Line>
              <GraphCard className="first halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.usersByGenderTitle} />
                  </GraphCardTitle>
                  <GenderChart startAt={startAt} endAt={endAt} currentGroupFilter={currentGroupFilter} />
                </GraphCardInner>
              </GraphCard>
              <GraphCard className="halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.usersByAgeTitle} />
                  </GraphCardTitle>
                  <AgeChart startAt={startAt} endAt={endAt} currentGroupFilter={currentGroupFilter} />
                </GraphCardInner>
              </GraphCard>
            </Line>
          </GraphsContainer>
        </ThemeProvider>
      </Container>
    );
  }
}
