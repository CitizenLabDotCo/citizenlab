import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import ActionButton from 'components/buttons/action.js';
import { Table } from 'semantic-ui-react';
import T from 'components/T';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deletePageRequest } from 'resources/pages/actions';

// messages
import messages from './messages';

const Row = ({ title, goToEdit, deletePage }) => (
  <Table.Row>
    <Table.Cell style={{ width: '100%' }}>
      <T value={title} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={goToEdit} message={messages.updateButton} fluid={false} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={deletePage} message={messages.deleteButton} fluid={false} />
    </Table.Cell>
  </Table.Row>
);

Row.propTypes = {
  goToEdit: PropTypes.func.isRequired,
  deletePage: PropTypes.func.isRequired,
  title: ImPropTypes.map.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  page: (state, { pageId }) => state.getIn(['resources', 'pages', pageId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { pageId } = ownP;
  const title = stateP.page.getIn(['attributes', 'title_multiloc']);
  const goToEdit = () => dispatchP.goTo(`/admin/pages/${pageId}/edit`);
  const deletePage = () => dispatchP.deletePage(pageId);

  return { title, goToEdit, deletePage };
};

export default preprocess(mapStateToProps, { goTo: push, deletePage: deletePageRequest }, mergeProps)(Row);
