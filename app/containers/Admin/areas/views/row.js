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
import { deleteAreaRequest } from 'resources/areas/actions';

// messages
import messages from './messages';

const Row = ({ title, goToEdit, deleteArea }) => (
  <Table.Row>
    <Table.Cell style={{ width: '100%' }}>
      <T value={title} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={goToEdit} message={messages.updateButton} fluid={false} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={deleteArea} message={messages.deleteButton} fluid={false} />
    </Table.Cell>
  </Table.Row>
);

Row.propTypes = {
  goToEdit: PropTypes.func.isRequired,
  deleteArea: PropTypes.func.isRequired,
  title: ImPropTypes.map.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  area: (state, { areaId }) => state.getIn(['resources', 'areas', areaId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { areaId } = ownP;
  const title = stateP.area.getIn(['attributes', 'title_multiloc']);
  const goToEdit = () => dispatchP.goTo(`/admin/areas/${areaId}/edit`);
  const deleteArea = () => dispatchP.deleteArea(areaId);

  return { title, goToEdit, deleteArea };
};

export default preprocess(mapStateToProps, { goTo: push, deleteArea: deleteAreaRequest }, mergeProps)(Row);
