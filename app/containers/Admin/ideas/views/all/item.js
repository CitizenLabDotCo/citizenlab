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
import { deleteIdeaRequest } from 'resources/ideas/actions';

// messages
import messages from '../messages';

const Item = ({ title, goToEdit, deleteIdea }) => (
  <div style={{ height: '35px', marginTop: '10px', backgroundColor: 'white' }}>
    <ActionButton action={deleteIdea} message={messages.deleteButton} fluid={false} />
    <ActionButton action={goToEdit} message={messages.updateButton} />
    <span> <T value={title} /> </span>
  </div>
);

Item.propTypes = {
  title: ImmutablePropTypes.map,
  goToEdit: PropTypes.func.isRequired,
  deleteIdea: PropTypes.func.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { ideaId }) => state.getIn(['resources', 'ideas', ideaId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { ideaId } = ownP;
  const { idea } = stateP;

  const title = idea.getIn(['attributes', 'title_multiloc']);

  const goToEdit = () => dispatchP.goTo(`/admin/ideas/${ideaId}/edit`);
  const deleteIdea = () => dispatchP.deleteIdea(ideaId);

  return { title, goToEdit, deleteIdea, ideaId };
};

export default preprocess(mapStateToProps, { goTo: push, deleteIdea: deleteIdeaRequest }, mergeProps)(Item);
