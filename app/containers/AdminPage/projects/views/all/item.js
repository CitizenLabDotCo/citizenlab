import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import T from 'utils/containers/t';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deleteProjectRequest } from 'resources/projects/actions';

// messages
import messages from '../messages';

const Item = ({ title, goToEdit, deleteProject }) => (
  <div style={{ height: '35px', marginTop: '10px', backgroundColor: 'white' }}>
    <ActionButton action={deleteProject} message={messages.deleteButton} fluid={false} />
    <ActionButton action={goToEdit} message={messages.updateButton} />
    <span> <T value={title} /> </span>
  </div>
);

Item.propTypes = {
  title: ImmutablePropTypes.map,
  goToEdit: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  project: (state, { projectId }) => state.getIn(['resources', 'projects', projectId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { projectId } = ownP;
  const { project } = stateP;

  const title = project.getIn(['attributes', 'title_multiloc']);

  const goToEdit = () => dispatchP.goTo(`/admin/projects/${projectId}/edit`);
  const deleteProject = () => dispatchP.deleteProject(projectId);

  return { title, goToEdit, deleteProject, projectId };
};

export default preprocess(mapStateToProps, { goTo: push, deleteProject: deleteProjectRequest }, mergeProps)(Item);
