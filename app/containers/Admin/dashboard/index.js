/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import styled, { ThemeProvider } from 'styled-components';
import { injectTFunc } from 'components/T/utils';
import moment from 'moment';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import TimeControl from './components/TimeControl';
import IntervalControl from './components/IntervalControl';
import GenderChart from './components/GenderChart';
import AgeChart from './components/AgeChart';
import IdeasByTimeChart from './components/IdeasByTimeChart';
import UsersByTimeChart from './components/UsersByTimeChart';
import IdeasByTopicChart from './components/IdeasByTopicChart';
import { Flex, Box } from 'grid-styled';

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const GraphCard = styled.div`
  background-color: #ffffff;
  border-radius: 5px;
  height: ${(props) => props.dynamicHeight ? 'auto' : '350px'};
  padding: 20px;
  flex-direction: column;
  display: flex;
  align-items: center;
`;

const GraphCardTitle = styled.h3`
  font-size: 20px;
  font-weight: 400;
  align-self: flex-start;
  padding-bottom: 20px;
`;

class DashboardPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  constructor() {
    super();
    this.state = {
      interval: 'month',
      intervalIndex: 0,
    };
  }

  calculateBoundaryDates(interval, intervalIndex) {
    const startAtMoment = moment().startOf(interval).add(intervalIndex, `${interval}s`);
    const endAtMoment = moment(startAtMoment).add(1, `${interval}s`);

    return { startAtMoment, endAtMoment };
  }

  changeInterval = (interval) => {
    this.setState({ interval, intervalIndex: 0 });
  };

  changeIntervalIndex = (intervalIndex) => {
    this.setState({ intervalIndex });
  }

  chartTheme = (theme) => ({
    ...theme,
    chartStroke: '#01A1B1',
    chartFill: '#01A1B1',
    barFill: '#ffffff',
    // chartStroke: lighten(0.3, theme.colorMain),
    // chartFill: lighten(0.3, theme.colorMain),
    chartLabelColor: '#999999',
    chartLabelSize: 13,
  });

  render() {
    const { startAtMoment, endAtMoment } = this.calculateBoundaryDates(this.state.interval, this.state.intervalIndex);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();
    const resolution = this.state.interval === 'year' ? 'month' : 'day';

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <ControlBar>
          <TimeControl
            value={this.state.intervalIndex}
            interval={this.state.interval}
            onChange={this.changeIntervalIndex}
            currentTime={startAtMoment}
          />
          <IntervalControl
            value={this.state.interval}
            onChange={this.changeInterval}
          />
        </ControlBar>
        <ThemeProvider theme={this.chartTheme}>
          <Flex mx={-10} my={20} wrap>
            <Box width={[1, 1, 1 / 2]} p={10}>
              <GraphCard >
                <GraphCardTitle>
                  <FormattedMessage {...messages.usersByGenderTitle} />
                </GraphCardTitle>
                <GenderChart startAt={startAt} endAt={endAt} />
              </GraphCard>
            </Box>
            <Box width={[1, 1, 1 / 2]} p={10}>
              <GraphCard>
                <GraphCardTitle>
                  <FormattedMessage {...messages.usersByAgeTitle} />
                </GraphCardTitle>
                <AgeChart startAt={startAt} endAt={endAt} />
              </GraphCard>
            </Box>
            <Box width={1} p={10}>
              <GraphCard>
                <GraphCardTitle>
                  <FormattedMessage {...messages.usersByTimeTitle} />
                </GraphCardTitle>
                <UsersByTimeChart startAt={startAt} endAt={endAt} resolution={resolution} />
              </GraphCard>
            </Box>
            <Box width={[1, 1, 1 / 2]} p={10}>
              <GraphCard>
                <GraphCardTitle>
                  <FormattedMessage {...messages.ideasByTimeTitle} />
                </GraphCardTitle>
                <IdeasByTimeChart startAt={startAt} endAt={endAt} resolution={resolution} />
              </GraphCard>
            </Box>
            <Box width={[1, 1, 1 / 2]} p={10}>
              <GraphCard dynamicHeight>
                <GraphCardTitle>
                  <FormattedMessage {...messages.ideasByTopicTitle} />
                </GraphCardTitle>
                <IdeasByTopicChart startAt={startAt} endAt={endAt} />
              </GraphCard>
            </Box>
          </Flex>
        </ThemeProvider>
      </div>);
  }
}

DashboardPage.propTypes = {
  tFunc: PropTypes.func.isRequired,
};


export default injectTFunc((DashboardPage));
