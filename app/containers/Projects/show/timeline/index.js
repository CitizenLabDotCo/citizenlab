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

const ProjectPhasesStyled = styled.div`
  width: 100%;
  /* TODO this can be improved by using dots as background with arrow from glyphicons [SUI] or with repeated background of 1x3px */
  border-left: dotted 3px #d7d7d7;
`;

class ProjectsTimeline extends React.PureComponent {
  componentDidMount() {
    this.props.loadProjectPhasesRequest(this.props.routeParams.projectId);
  }

  /* @params:
   * - Date iso: string
   * - Date iso: string
   * @returns
   * - phase type: string (past|current|coming)
   */
  getPhaseType(startingDate, endingDate) {
    // TODO
    console.log(startingDate, endingDate);
    return 'current';
  }

  /* @params:
   * - Date iso: string
   * @returns
   * - date: string (day month)
   */
  parseDate(dateIsoString) {
    // TODO
    console.log(dateIsoString);
    return 'X Y';
  }

  render() {
    const { phases } = this.props;

    return (<div>
      <WatchSagas sagas={sagas} />
      <ProjectPhasesStyled>
        {phases && phases.map((phase, index) => (<ProjectPhase
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
};

const mapStateToProps = () => createStructuredSelector({
  phases: makeSelectPhases(),
});

const mergeProps = ({ phases }, { loadProjectPhasesRequest: lpr }, { routeParams }) => ({
  routeParams,
  loadProjectPhasesRequest: lpr,
  phases: phases && phases.toJS(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadProjectPhasesRequest }, dispatch);

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(ProjectsTimeline);
