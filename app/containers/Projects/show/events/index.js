import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectEvents } from './selectors';
import { loadProjectEventsRequest } from 'resources/projects/events/actions';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/projects/phases/sagas';
import ProjectEvent from './ProjectEvent';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { LOAD_PROJECT_EVENTS_REQUEST } from 'resources/projects/events/constants';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import scrollToComponent from 'react-scroll-to-component';
import { getCurrentEventId } from '../lib';

const ProjectPhasesStyled = styled.div`
  width: 100%;
  /* TODO: this can be improved by using dots as background with arrow from glyphicons [SUI] or with repeated background of 1x3px */
  border-left: dotted 3px #d7d7d7;
`;

class ProjectsEvents extends React.PureComponent {
  componentDidMount() {
    this.props.loadProjectEventsRequest(this.props.routeParams.projectId);
  }

  componentDidUpdate() {
    const { events, loading } = this.props;
    const currentEventId = getCurrentEventId(events);
    if (events && !loading && events.length > 0) {
      if (currentEventId) {
        scrollToComponent(this[`phase-${currentEventId}`], {
          offset: 400,
          align: 'middle',
          duration: 500,
          ease: 'inCirc',
        });
      }
    }
  }

  render() {
    const { events, loading, error/* , locale */} = this.props;

    return (<div>
      <WatchSagas sagas={sagas} />
      {((events && events.length === 0) || !(events || error)) && <FormattedMessage {...messages.noEvents} />}
      {loading && <FormattedMessage {...messages.loading} />}
      {error && <FormattedMessage {...messages.error} />}

      <ProjectPhasesStyled>
        {/* TODO: pass appropriate props */}
        {events && events.map((event, index) => (<ProjectEvent
        />))}
      </ProjectPhasesStyled>
    </div>);
  }
}


ProjectsEvents.propTypes = {
  routeParams: PropTypes.object.isRequired,
  loadProjectEventsRequest: PropTypes.func.isRequired,
  events: PropTypes.array,
  locale: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

const mapStateToProps = () => createStructuredSelector({
  events: makeSelectEvents(),
  locale: makeSelectLocale(),
  loading: (state) => state.getIn(['tempState', LOAD_PROJECT_EVENTS_REQUEST, 'loading']),
  error: (state) => state.getIn(['tempState', LOAD_PROJECT_EVENTS_REQUEST, 'error']),
});

const mergeProps = ({ events, locale, loading, error }, { loadProjectEventsRequest: lpr }, { routeParams }) => ({
  routeParams,
  loadProjectEventsRequest: lpr,
  events: events && events.toJS(),
  locale,
  loading,
  error,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadProjectEventsRequest }, dispatch);

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(ProjectsEvents);
