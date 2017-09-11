import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import T from 'containers/T';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deleteAreaRequest } from 'resources/areas/actions';

// messages
import messages from '../messages';

const Item = ({ title, goToEdit, deleteArea }) => (
  <div style={{ height: '35px', marginTop: '10px', backgroundColor: 'white' }}>
    <ActionButton action={deleteArea} message={messages.deleteButton} fluid={false} />
    <ActionButton action={goToEdit} message={messages.updateButton} />
    <span> <T value={title} /> </span>
  </div>
);

Item.propTypes = {
  title: ImmutablePropTypes.map,
  goToEdit: PropTypes.func.isRequired,
  deleteArea: PropTypes.func.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  area: (state, { areaId }) => state.getIn(['resources', 'areas', areaId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { areaId } = ownP;
  const { area } = stateP;

  const title = area.getIn(['attributes', 'title_multiloc']);

  const goToEdit = () => dispatchP.goTo(`/admin/areas/${areaId}/edit`);
  const deleteArea = () => dispatchP.deleteArea(areaId);

  return { title, goToEdit, deleteArea, areaId };
};

export default preprocess(mapStateToProps, { goTo: push, deleteArea: deleteAreaRequest }, mergeProps)(Item);
