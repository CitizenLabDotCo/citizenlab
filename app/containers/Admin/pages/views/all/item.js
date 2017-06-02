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
import { deletePageRequest } from 'resources/pages/actions';

// messages
import messages from '../messages';

const Item = ({ title, goToEdit, deletePage }) => (
  <div style={{ height: '35px', marginTop: '10px', backgroundColor: 'white' }}>
    <ActionButton action={deletePage} message={messages.deleteButton} fluid={false} />
    <ActionButton action={goToEdit} message={messages.updateButton} />
    <span> <T value={title} /> </span>
  </div>
);

Item.propTypes = {
  title: ImmutablePropTypes.map,
  goToEdit: PropTypes.func.isRequired,
  deletePage: PropTypes.func.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  page: (state, { pageId }) => state.getIn(['resources', 'pages', pageId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { pageId } = ownP;
  const { page } = stateP;

  const title = page.getIn(['attributes', 'title_multiloc']);

  const goToEdit = () => dispatchP.goTo(`/admin/pages/${pageId}/edit`);
  const deletePage = () => dispatchP.deletePage(pageId);

  return { title, goToEdit, deletePage, pageId };
};

export default preprocess(mapStateToProps, { goTo: push, deletePage: deletePageRequest }, mergeProps)(Item);
