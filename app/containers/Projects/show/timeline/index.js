import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectPhases } from './selectors';
import { loadProjectPhasesRequest } from 'resources/projects/phases/actions';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/projects/phases/sagas';
import ProjectPhase from './ProjectPhase';
import moment from 'moment';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { LOAD_PROJECT_PHASES_REQUEST } from 'resources/projects/phases/constants';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import scrollToComponent from 'react-scroll-to-component';

const ProjectPhasesStyled = styled.div`
  width: 100%;
  /* TODO this can be improved by using dots as background with arrow from glyphicons [SUI] or with repeated background of 1x3px */
  border-left: dotted 3px #d7d7d7;
`;

class ProjectsTimeline extends React.PureComponent {
  constructor() {
    super();

    // provde context to bindings
    this.getPhaseType = this.getPhaseType.bind(this);
    this.getCurrentPhaseId = this.getCurrentPhaseId.bind(this);
  }

  componentDidMount() {
    this.props.loadProjectPhasesRequest(this.props.routeParams.projectId);
  }

  componentDidUpdate() {
    const { phases, loading } = this.props;
    const currentPhaseId = this.getCurrentPhaseId();
    if (phases && !loading && phases.length > 0) {
      if (currentPhaseId) {
        scrollToComponent(this[`phase-${currentPhaseId}`], {
          offset: 400,
          align: 'middle',
          duration: 500,
          ease: 'inCirc',
        });
      }
    }
  }

  getCurrentPhaseId() {
    const { phases } = this.props;

    if (!phases) return -1;

    const classRef = this;
    const p = phases.filter((phase) => classRef.getPhaseType(phase.attributes.start_at, phase.attributes.end_at) === 'current')[0];

    return p && p.id;
  }

  /* @params:
   * - Date iso: string
   * - Date iso: string
   * @returns
   * - phase type: string (past|current|coming)
   */
  getPhaseType(startingDate, endingDate) {
    const nowM = moment();
    const startingDateMDiff = moment(startingDate) - nowM;
    const endingDateMDiff = moment(endingDate) - nowM;

    if (startingDateMDiff < 0 && endingDateMDiff < 0) return 'past';
    else if (startingDateMDiff < 0 && endingDateMDiff > 0) return 'current';

    // both positive
    return 'coming';
  }

  /* @params:
   * - Date iso: string
   * @returns
   * - date: string (day month) matching current locale
   */
  parseDate(dateIsoString) {
    const { locale } = this.props;

    return moment(dateIsoString).locale(locale).format('DD MMM');
  }

  render() {
    const { phases, loading, error } = this.props;

    return (<div>
      <WatchSagas sagas={sagas} />
      {phases && phases.length === 0 && <FormattedMessage {...messages.noTimeline} />}
      {loading && <FormattedMessage {...messages.loading} />}
      {error && <FormattedMessage {...messages.error} />}

      <ProjectPhasesStyled>
        {phases && phases.map((phase, index) => (<ProjectPhase
          ref={(phaseL) => { this[`phase-${phase.id}`] = phaseL; }}
          key={phase.id}
          phaseIndex={index + 1}
          phase={this.getPhaseType(phase.attributes.start_at, phase.attributes.end_at)}
          fromTo={this.parseDate(phase.attributes.start_at)}
          tillTo={this.parseDate(phase.attributes.end_at)}
          titleMultiloc={phase.attributes.title_multiloc}
          descriptionMultiLoc={phase.attributes.description_multiloc}
        />))}
      </ProjectPhasesStyled>
    </div>);
  }
}


ProjectsTimeline.propTypes = {
  routeParams: PropTypes.object.isRequired,
  loadProjectPhasesRequest: PropTypes.func.isRequired,
  phases: PropTypes.array,
  locale: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

const mapStateToProps = () => createStructuredSelector({
  phases: makeSelectPhases(),
  locale: makeSelectLocale(),
  loading: (state) => state.getIn(['tempState', LOAD_PROJECT_PHASES_REQUEST, 'loading']),
  error: (state) => state.getIn(['tempState', LOAD_PROJECT_PHASES_REQUEST, 'error']),
});

const mergeProps = ({ phases, locale, loading, error }, { loadProjectPhasesRequest: lpr }, { routeParams }) => ({
  routeParams,
  loadProjectPhasesRequest: lpr,
  phases: phases && phases.toJS(),
  locale,
  loading,
  error,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadProjectPhasesRequest }, dispatch);

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(ProjectsTimeline);
