// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import { chartTheme, Container, GraphsContainer, Line, GraphCard, GraphCardInner, GraphCardTitle } from '../';
import GenderChart from '../components/GenderChart';
import AgeChart from '../components/AgeChart';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
  currentGroupFilter: string;
}

type Props = {

};

export default class UsersDashboard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
      currentGroupFilter: ''
    };
  }

  render() {
    const { interval, intervalIndex } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();

    return (
      <Container>
      <ThemeProvider theme={chartTheme}>
        <GraphsContainer>
          <Line>
            <GraphCard className="first halfWidth">
              <GraphCardInner>
                <GraphCardTitle>
                  <FormattedMessage {...messages.usersByGenderTitle} />
                </GraphCardTitle>
                <GenderChart startAt={startAt} endAt={endAt} />
              </GraphCardInner>
            </GraphCard>
            <GraphCard className="halfWidth">
              <GraphCardInner>
                <GraphCardTitle>
                  <FormattedMessage {...messages.usersByAgeTitle} />
                </GraphCardTitle>
                <AgeChart startAt={startAt} endAt={endAt} />
              </GraphCardInner>
            </GraphCard>
          </Line>
        </GraphsContainer>
        </ThemeProvider>
      </Container>
    );
  }
}
