/* eslint-disable jsx-a11y/no-static-element-interactions */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import { preprocess } from 'utils/reactRedux';
import styled from 'styled-components';
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
import TimeControl from './TimeControl';
import IntervalControl from './IntervalControl';

const ControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

class DashboardPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
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

  changeIntervalIndex = (newIntervalIndex) => {
    const { interval } = this.state;
    const { startAt, endAt } = this.getNewBoundaryDates(interval, newIntervalIndex);

    this.setState({
      startAt,
      endAt,
      intervalIndex: newIntervalIndex,
    });

    this.props.loadUsersReportRequest(startAt, endAt, interval);
    this.props.loadIdeaTopicsReportRequest(startAt, endAt);
    this.props.loadIdeaAreasReportRequest(startAt, endAt);
  }

  // day, week, ...
  changeInterval = (interval) => {
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


  render() {
    const { tFunc, newUsers, ideasByTopic, ideasByArea } = this.props;
    // const { formatMessage } = this.props.intl;
    // const { interval } = this.state;

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
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <ControlBar>
          <TimeControl
            value={this.state.intervalIndex}
            interval={this.state.interval}
            onChange={this.changeIntervalIndex}
          />
          <IntervalControl
            value={this.state.interval}
            onChange={this.changeInterval}
          />
        </ControlBar>

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

DashboardPage.propTypes = {
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

export default injectTFunc(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(DashboardPage)));
