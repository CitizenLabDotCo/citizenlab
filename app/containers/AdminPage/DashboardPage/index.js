/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { Grid, Icon, Segment, Menu } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import { preprocess } from 'utils/reactRedux';
import WatchSagas from 'containers/WatchSagas';
import { injectTFunc } from 'containers/T/utils';
import FormattedMessageSegment from 'components/FormattedMessageSegment';
import moment from 'moment';

import sagas from './sagas';
import messages from './messages';
import { selectAdminDashboard } from './selectors';
import {
  loadIdeaAreasReportRequest, loadIdeaTopicsReportRequest, loadUsersReportRequest,
} from './actions';
import { LineChartWrapper } from './LineChartWrapper';
import { BarChartWrapper } from './BarChartWrapper';

class AdminPages extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    const startAt = moment().subtract(1, 'months').toISOString();
    const endAt = moment().toISOString();
    this.state = {
      interval: 'month',
      intervalIndex: -1,
      startAt,
      endAt,
    };

    // context for bindings
    this.updateInterval = this.updateInterval.bind(this);
    this.goToPreviousInterval = this.goToPreviousInterval.bind(this);
    this.goToFollowingInterval = this.goToFollowingInterval.bind(this);
  }

  componentDidMount() {
    const { startAt, endAt, interval } = this.state;

    this.props.loadUsersReportRequest(startAt, endAt, interval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  }

  getNewBoundaryDates(interval, newIntervalIndex) {
    let startAt;
    let endAt;

    // calculate new startAt/endAt
    if (newIntervalIndex < 0) {
      startAt = moment().subtract(Math.abs(newIntervalIndex), interval).toISOString();
      endAt = moment().subtract(Math.abs(newIntervalIndex + 1), interval).toISOString();
    } else if (newIntervalIndex === 0) {
      startAt = moment().toISOString();
      endAt = moment().add(1, interval).toISOString();
    } else {
      startAt = moment().add(newIntervalIndex, interval).toISOString();
      endAt = moment().add(newIntervalIndex + 1, interval).toISOString();
    }

    return {
      startAt,
      endAt,
    };
  }


  // day, week, ...
  updateInterval = (interval) => {
    const startAt = moment().subtract(1, `${interval}s`).toISOString();
    const endAt = moment().toISOString();

    this.setState({
      interval,
      startAt,
      endAt,
      intervalIndex: -1,
    });

    // reload data for charts depending on interval
    this.props.loadUsersReportRequest(startAt, endAt, interval);
  };

  // previous day, week, ...
  goToPreviousInterval = () => {
    const { interval, intervalIndex } = this.state;

    const newIntervalIndex = intervalIndex - 1;
    const { startAt, endAt } = this.getNewBoundaryDates(interval, newIntervalIndex);

    this.setState({
      startAt,
      endAt,
      intervalIndex: newIntervalIndex,
    });

    this.props.loadUsersReportRequest(startAt, endAt, interval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  };

  // following day, week, ...
  goToFollowingInterval = () => {
    const { interval, intervalIndex } = this.state;

    const newIntervalIndex = intervalIndex + 1;
    const { startAt, endAt } = this.getNewBoundaryDates(interval, newIntervalIndex);

    this.setState({
      startAt,
      endAt,
      intervalIndex: newIntervalIndex,
    });

    this.props.loadUsersReportRequest(startAt, endAt, interval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  };

  render() {
    const { tFunc, newUsers, ideasByTopic, ideasByArea } = this.props;
    const { formatMessage } = this.props.intl;
    const { interval } = this.state;

    // refactor data for charts (newUsers.data etc. based on API specs response)
    // name on X axis (Y when version layout), value on Y axis (X when version layout)
    // newUsers etc. are not immutable, but .labels / .values are
    const newUsersData = newUsers.labels.toJS().map((item, index) => ({
      label: item,
      value: newUsers.values.toJS()[index],
    }));
    const ideasByTopicData = ideasByTopic.labels.toJS().map((item, index) => ({
      label: `${tFunc(item)} (${ideasByTopic.values.toJS()[index]})`,
      value: ideasByTopic.values.toJS()[index],
    }));
    const ideasByAreaData = ideasByArea.labels.toJS().map((item, index) => ({
      label: `${tFunc(item)} (${ideasByArea.values.toJS()[index]})`,
      value: ideasByArea.values.toJS()[index],
    }));

    return (
      <div>
        <WatchSagas sagas={sagas} />
        <Helmet
          title="Admin dashboard page"
          meta={[
            { name: 'description', content: 'Dashboard for activities on the platform' },
          ]}
        />
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={4}>
              <Segment>
                {/* Interval */}
                <span
                  style={{ cursor: 'pointer' }}
                  role="presentation"
                  onClick={this.goToPreviousInterval}
                >
                  <Icon name="left chevron" />
                </span>
                <FormattedMessage {...messages.interval} />
                <span
                  style={{ cursor: 'pointer' }}
                  role="presentation"
                  onClick={this.goToFollowingInterval}
                >
                  <Icon name="right chevron" />
                </span>
              </Segment>
            </Grid.Column>
            <Grid.Column width={12}>
              <Segment inverted>
                <Menu inverted pointing secondary>
                  <span
                    onClick={() => this.updateInterval('day')}
                    style={{ cursor: 'pointer' }}
                    role="button"
                  >
                    <Menu.Item name={formatMessage(messages.day)} active={interval === 'day'} />
                  </span>
                  <span
                    onClick={() => this.updateInterval('week')}
                    style={{ cursor: 'pointer' }}
                    role="presentation"
                  >
                    <Menu.Item name={formatMessage(messages.week)} active={interval === 'week'} />
                  </span>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.updateInterval('month')}
                    role="presentation"
                  >
                    <Menu.Item name={formatMessage(messages.month)} active={interval === 'month'} />
                  </span>
                  <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => this.updateInterval('year')}
                    role="presentation"
                  >
                    <Menu.Item name={formatMessage(messages.year)} active={interval === 'year'} />
                  </span>
                </Menu>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div>
          {/* TODO: consider wrapping charts in a Chart component within this container ...
              ... for code reuse */}
          <FormattedMessage {...messages.usersOverTime} />
          {newUsers.loading && <FormattedMessage {...messages.loading} />}
          {newUsers.loadError && <FormattedMessageSegment message={messages.loadError} />}
          {!newUsers.error && newUsersData && <LineChartWrapper data={newUsersData} />}
        </div>
        <div>
          <FormattedMessage {...messages.ideasByTopic} />
          {ideasByTopic.loading && <FormattedMessageSegment message={messages.loading} />}
          {ideasByTopic.loadError && <FormattedMessageSegment message={messages.loadError} />}
          {!ideasByTopic.error && ideasByTopicData && <BarChartWrapper
            data={ideasByTopicData}
            layout="vertical"
          />}
        </div>
        <div>
          <FormattedMessage {...messages.ideasByArea} />
          {ideasByArea.loading && <FormattedMessageSegment message={messages.loading} />}
          {ideasByArea.loadError && <FormattedMessageSegment message={messages.loadError} />}
          {!ideasByArea.error && ideasByAreaData && <BarChartWrapper
            data={ideasByAreaData}
            layout="vertical"
          />}
        </div>
      </div>);
  }
}

AdminPages.propTypes = {
  newUsers: PropTypes.object.isRequired,
  ideasByTopic: PropTypes.object.isRequired,
  ideasByArea: PropTypes.object.isRequired,
  loadUsersReportRequest: PropTypes.func.isRequired,
  loadIdeaTopicsReportRequest: PropTypes.func.isRequired,
  loadIdeaAreasReportRequest: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectAdminDashboard,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadUsersReportRequest,
  loadIdeaTopicsReportRequest,
  loadIdeaAreasReportRequest,
}, dispatch);

const mergeProps = ({ pageState, statTopics, statAreas }, dispatchProps, { intl, tFunc }) => ({
  newUsers: {
    loading: pageState.getIn(['newUsers', 'loading']),
    loadError: pageState.getIn(['newUsers', 'loadError']),
    values: pageState.getIn(['newUsers', 'values']),
    labels: pageState.getIn(['newUsers', 'labels']),
  },
  ideasByTopic: {
    loading: pageState.getIn(['ideasByTopic', 'loading']),
    loadError: pageState.getIn(['ideasByTopic', 'loadError']),
    values: pageState.getIn(['ideasByTopic', 'values']),
    labels: pageState.getIn(['ideasByTopic', 'labels']),
  },
  ideasByArea: {
    loading: pageState.getIn(['ideasByArea', 'loading']),
    loadError: pageState.getIn(['ideasByArea', 'loadError']),
    values: pageState.getIn(['ideasByArea', 'values']),
    labels: pageState.getIn(['ideasByArea', 'labels']),
  },
  intl,
  tFunc,
  ...dispatchProps,
});

export default injectTFunc(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(AdminPages)));
