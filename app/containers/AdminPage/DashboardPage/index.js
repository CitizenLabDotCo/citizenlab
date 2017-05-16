import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { Grid, Icon, Segment, Menu } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import { preprocess } from 'utils/reactRedux';
import { getFromState } from 'utils/immutables';
import WatchSagas from 'containers/WatchSagas';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import Sidebar from './../SideBar/';
import sagas from './sagas';
import messages from './messages';
import { selectAdminDashboard } from './selectors';
import {
  loadIdeaAreasReportRequest, loadIdeaTopicsReportRequest, loadUsersReportRequest,
} from './actions';

const Wrapper = styled.div`
  padding-top: 100px;
`;

const intervals = [
  'day',
  'week',
  'month',
  'year',
];

// TODO: calculate month depending on each month's length and year based on lapse year or not
// ... > ! use moment.js (https://momentjs.com/docs/#/plugins/recur/) to go to prev/next day/week/month/year
const dateIntervalsMs = {
  day: 24 * 60 * 60 * 1000,
  week: 24 * 60 * 60 * 1000 * 7,
  month: 24 * 60 * 60 * 1000 * 30,
  year: 24 * 60 * 60 * 1000 * 365,
};

class AdminPages extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // context for bindings
    this.updateInterval = this.updateInterval.bind(this);
    this.goToPreviousInterval = this.goToPreviousInterval.bind(this);
    this.goToFollowingInterval = this.goToFollowingInterval.bind(this);
  }

  componentDidMount() {
    const todayDate = new Date();
    const startAt = new Date(todayDate.getTime() - dateIntervalsMs.month).toISOString();
    const endAt = todayDate.toISOString();
    const interval = 'month';

    this.loadAreasRequest(startAt, endAt);
    this.loadTopicsRequest(startAt, endAt);

    this.state = {
      interval,
    };

    this.props.loadUsersReportRequest(startAt, endAt, interval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  }

  // day, week, ...
  updateInterval = (e, { name }) => {
    const interval = name;

    // TODO: replace with momentJS' methods (see TODO before class definition)
    const todayDate = new Date();
    const startAt = new Date(todayDate.getTime() - dateIntervalsMs[interval]).toISOString();
    const endAt = todayDate.toISOString();

    this.setState({
      interval,
    });

    // reload data for charts depending on interval
    this.props.loadUsersReportRequest(startAt, endAt, interval);
  };

  // previous day, week, ...
  goToPreviousInterval = () => {
    const { interval } = this.state;

    // calculate new startAt/endAt
    // TODO: replace with momentJS' methods (see TODO before class definition)
    const todayDate = new Date();
    const startAt = new Date(todayDate.getTime() - dateIntervalsMs[interval]).toISOString();
    const endAt = todayDate.toISOString();

    const newInterval = (interval === 'day'
      ? interval
      : intervals[intervals.indexOf(interval) - 1]
    );

    this.setState({
      interval: newInterval,
    });

    this.props.loadUsersReportRequest(startAt, endAt, newInterval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  };

  // following day, week, ...
  goToFollowingInterval = () => {
    const { interval } = this.state;

    // calculate new startAt/endAt
    // TODO: replace with momentJS' methods (see TODO before class definition)
    const todayDate = new Date();
    const startAt = new Date(todayDate.getTime() + dateIntervalsMs[interval]).toISOString();
    const endAt = todayDate.toISOString();

    const newInterval = (interval === 'day'
        ? interval
        : intervals[intervals.indexOf(interval) - 1]
    );

    this.setState({
      interval: newInterval,
      startAt,
      endAt,
    });

    this.props.loadUsersReportRequest(startAt, endAt, newInterval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  };

  render() {
    const { location, tFunc, newUsers, ideasByTopic, ideasByArea } = this.props;
    const { formatMessage } = this.props.intl;
    const { interval } = this.state;

    // refactor data for charts (newUsers.data etc. based on API specs response)
    // name on X axis, value on Y axis
    const newUsersData = newUsers.stats.map((record) => ({
      name: tFunc(record.title_multiloc),
      value: newUsers.stats[record.id],
    }));

    const ideasByTopicData = ideasByTopic.stats.map((record) => ({
      name: tFunc(record.title_multiloc),
      value: record.count,
    }));

    const ideasByAreaData = ideasByArea.stats.map((record) => ({
      name: tFunc(record.title_multiloc),
      value: record.count,
    }));

    return (
      <div>
        <WatchSagas sagas={sagas} />
        <Wrapper>
          <Grid stackable>
            <Grid.Row>
              <Grid.Column width={3}>
                <Sidebar location={location} />
              </Grid.Column>
              <Grid.Column width={10}>
                <Grid>
                  <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                      <Segment>
                        {/* Interval */}
                        <Icon name="left chevron" />
                        <FormattedMessage {...messages.interval} />
                        <Icon name="right chevron" />
                      </Segment>
                    </Grid.Column>
                    <Grid.Column width={12}>
                      <Segment inverted>
                        <Menu inverted pointing secondary>
                          <Menu.Item name={formatMessage(messages.day)} active={interval === 'day'} onClick={this.updateInterval} />
                          <Menu.Item name={formatMessage(messages.week)} active={interval === 'week'} onClick={this.updateInterval} />
                          <Menu.Item name={formatMessage(messages.month)} active={interval === 'month'} onClick={this.updateInterval} />
                          <Menu.Item name={formatMessage(messages.year)} active={interval === 'year'} onClick={this.updateInterval} />
                        </Menu>
                      </Segment>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    {/* TODO: consider wrapping charts in a Chart component within this container ...
                        ... for code reuse */}
                    <FormattedMessage {...messages.usersOverTime} />
                    {newUsers.loading && <FormattedMessage {...messages.loading} />}
                    {newUsers.loadError && <FormattedMessage {...messages.loadError} />}
                    {!newUsers.error && newUsersData && <LineChart
                      width={730}
                      height={250}
                      data={newUsersData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                      <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                    </LineChart>}
                  </Grid.Row>
                  <Grid.Row columns={2}>
                    <Grid.Column width={8}>
                      <FormattedMessage {...messages.ideasByTopic} />
                      {ideasByTopic.loading && <FormattedMessage {...messages.loading} />}
                      {ideasByTopic.loadError && <FormattedMessage {...messages.loadError} />}
                      {!ideasByTopic.error && ideasByTopicData && <BarChart
                        width={730}
                        height={250}
                        data={ideasByTopicData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pv" />
                        <Bar dataKey="uv" />
                      </BarChart>}
                    </Grid.Column>
                    <Grid.Column width={8}>
                      <FormattedMessage {...messages.ideasByArea} />
                      {!ideasByArea.error && ideasByAreaData && <BarChart
                        width={730}
                        height={250}
                        data={ideasByAreaData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                      </BarChart>}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Wrapper>
      </div>
    );
  }
}

AdminPages.propTypes = {
  newUsers: ImmutablePropTypes.map.isRequired,
  ideasByTopic: ImmutablePropTypes.map.isRequired,
  ideasByArea: ImmutablePropTypes.map.isRequired,
  loadUsersReportRequest: PropTypes.func.isRequired,
  loadIdeaTopicsReportRequest: PropTypes.func.isRequired,
  loadIdeaAreasReportRequest: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
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

const mergeProps = ({ pageState, statTopics, statAreas }, dispatchProps, { location, intl, tFunc }) => ({
  newUsers: getFromState(pageState, 'newUsers'),
  ideasByTopic: {
    loading: getFromState(pageState, 'ideasByTopic', 'loading'),
    loadError: getFromState(pageState, 'ideasByTopic', 'loadError'),
    stats: getFromState(pageState, 'ideasByTopic', 'data'),
  },
  ideasByArea: {
    loading: getFromState(pageState, 'ideasByArea', 'loading'),
    loadError: getFromState(pageState, 'ideasByArea', 'loadError'),
    stats: getFromState(pageState, 'ideasByArea', 'data'),
  },
  location,
  intl,
  tFunc,
  ...dispatchProps,
});

export default injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(AdminPages));
