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
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { LOAD_PROJECT_PHASES_REQUEST } from 'resources/projects/phases/constants';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import scrollToComponent from 'react-scroll-to-component';
import { getCurrentPhaseId, getPhaseType, parseDate } from '../lib';

const ProjectPhasesStyled = styled.div`
  width: 100%;
  /* TODO: this can be improved by using dots as background with arrow from glyphicons [SUI] or with repeated background of 1x3px */
  border-left: dotted 3px #d7d7d7;
`;

class ProjectsTimeline extends React.PureComponent {
  componentDidMount() {
    this.props.loadProjectPhasesRequest(this.props.routeParams.projectId);
  }

  componentDidUpdate() {
    const { phases, loading } = this.props;
    const currentPhaseId = getCurrentPhaseId(phases);
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

  render() {
    const { phases, loading, error, locale } = this.props;

    return (<div>
      <WatchSagas sagas={sagas} />
      {((phases && phases.length === 0) || !(phases || error)) && <FormattedMessage {...messages.noTimeline} />}
      {loading && <FormattedMessage {...messages.loading} />}
      {error && <FormattedMessage {...messages.error} />}

      <ProjectPhasesStyled>
        {phases && phases.map((phase, index) => (<ProjectPhase
          ref={(phaseL) => { this[`phase-${phase.id}`] = phaseL; }}
          key={phase.id}
          phaseIndex={index + 1}
          phase={getPhaseType(phase.attributes.start_at, phase.attributes.end_at)}
          fromTo={parseDate(phase.attributes.start_at, locale)}
          tillTo={parseDate(phase.attributes.end_at, locale)}
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
