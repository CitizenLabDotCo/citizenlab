import React, { PureComponent } from 'react';
import moment from 'moment';
import HelmetIntl from 'components/HelmetIntl';
import styled, { ThemeProvider } from 'styled-components';
import Link from 'utils/cl-router/Link';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import FeatureFlag from 'components/FeatureFlag';
import Warning from 'components/UI/Warning';
import TimeControl from './components/TimeControl';
import IntervalControl from './components/IntervalControl';
import GenderChart from './components/GenderChart';
import AgeChart from './components/AgeChart';
import IdeasByTimeChart from './components/IdeasByTimeChart';
import UsersByTimeChart from './components/UsersByTimeChart';
import IdeasByTopicChart from './components/IdeasByTopicChart';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 30px;
`;

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

const GraphsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const Line = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;

  &.last {
    margin-bottom: 0px;
  }
`;

const GraphCardInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: absolute;
  top: 0;
  left: 0;
`;

const GraphCard = styled.div`
  width: 100%;
  height: 350px;
  display: flex;
  position: relative;
  border: solid 1px ${colors.adminBorder};
  border-radius: 5px;
  background: ${colors.adminContentBackground};

  &.dynamicHeight {
    height: auto;

    ${GraphCardInner} {
      position: relative;
    }
  }

  &.first {
    margin-right: 20px;
  }

  &.halfWidth {
    width: 50%;
  }
`;

const GraphCardTitle = styled.h3`
  font-size: ${fontSizes.xl}px;
  font-weight: 400;
  align-self: flex-start;
  padding-bottom: 20px;
`;

interface Props {}

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
}

export default class DashboardPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0
    };
  }

  changeInterval = (interval: 'weeks' | 'months' | 'years') => {
    this.setState({ interval, intervalIndex: 0 });
  }

  changeIntervalIndex = (intervalIndex: number) => {
    this.setState({ intervalIndex });
  }

  chartTheme = (theme) => {
    return {
      ...theme,
      chartStroke: colors.clIconAccent,
      chartFill: colors.clIconAccent,
      barFill: colors.adminContentBackground,
      chartLabelColor: colors.adminSecondaryTextColor,
      chartLabelSize: 13
    };
  }

  render() {
    const { interval, intervalIndex } = this.state;
    const startAtMoment = moment().startOf(interval).add(intervalIndex, interval);
    const endAtMoment = moment(startAtMoment).add(1, interval);
    const startAt = startAtMoment.toISOString();
    const endAt = endAtMoment.toISOString();
    const resolution = (interval === 'years' ? 'month' : 'day');

    return (
      <Container>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <FeatureFlag name={'clustering'}>
          <StyledWarning
            text={
              <FormattedMessage
                {...messages.tryOutInsights}
                values={{
                  insightsLink: <Link to={`/admin/clusterings`}><FormattedMessage {...messages.insightsLinkText} /></Link>
                }}
              />
            }
          />
        </FeatureFlag>

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

        <ThemeProvider theme={this.chartTheme}>
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

            <Line>
              <GraphCard>
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.usersByTimeTitle} />
                  </GraphCardTitle>
                  <UsersByTimeChart startAt={startAt} endAt={endAt} resolution={resolution} />
                </GraphCardInner>
              </GraphCard>
            </Line>

            <Line className="last">
              <GraphCard className="first halfWidth">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.ideasByTimeTitle} />
                  </GraphCardTitle>
                  <IdeasByTimeChart startAt={startAt} endAt={endAt} resolution={resolution} />
                </GraphCardInner>
              </GraphCard>
              <GraphCard className="halfWidth dynamicHeight">
                <GraphCardInner>
                  <GraphCardTitle>
                    <FormattedMessage {...messages.ideasByTopicTitle} />
                  </GraphCardTitle>
                  <IdeasByTopicChart startAt={startAt} endAt={endAt} />
                </GraphCardInner>
              </GraphCard>
            </Line>
          </GraphsContainer>
        </ThemeProvider>
      </Container>
    );
  }
}
