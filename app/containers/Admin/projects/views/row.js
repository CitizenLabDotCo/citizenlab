import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import ActionButton from 'components/buttons/action.js';
import { Table } from 'semantic-ui-react';
import T from 'utils/containers/t';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deleteProjectRequest } from 'resources/projects/actions';

// messages
import messages from './messages';

const Row = ({ title, goToEdit, deleteProject }) => (
  <Table.Row>
    <Table.Cell style={{ width: '100%' }}>
      <T value={title} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={goToEdit} message={messages.updateButton} fluid={false} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={deleteProject} message={messages.deleteButton} fluid={false} />
    </Table.Cell>
  </Table.Row>
);

Row.propTypes = {
  goToEdit: PropTypes.func.isRequired,
  deleteProject: PropTypes.func.isRequired,
  title: ImPropTypes.map.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  project: (state, { projectId }) => state.getIn(['resources', 'projects', projectId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { projectId } = ownP;
  const title = stateP.project.getIn(['attributes', 'title_multiloc']);
  const goToEdit = () => dispatchP.goTo(`/admin/projects/${projectId}/edit`);
  const deleteProject = () => dispatchP.deleteProject(projectId);

  return { title, goToEdit, deleteProject };
};

export default preprocess(mapStateToProps, { goTo: push, deleteProject: deleteProjectRequest }, mergeProps)(Row);
