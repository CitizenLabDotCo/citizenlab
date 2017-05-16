import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import { preprocess } from 'utils';
// import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

const IdeaTableRow = ({ idea }) => (
  <Table.Row key={idea.get('id')}>
    <Table.Cell>{idea.get('id')}</Table.Cell>
    <Table.Cell>{idea.getIn(['attributes', 'author_name'])}</Table.Cell>
  </Table.Row>
);

IdeaTableRow.propTypes = {
  idea: PropTypes.object.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  idea: (state, { id }) => selectResourcesDomain('ideas', id)(state),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { idea } = stateProps;
  return { idea, ...ownProps };
};

export default preprocess(mapStateToProps, null, mergeProps)(IdeaTableRow);
