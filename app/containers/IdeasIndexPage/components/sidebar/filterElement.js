import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Menu } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';

import T from 'containers/T';
import { loadIdeas } from '../../actions';
import selectIdeasIndexPageDomain from '../../selectors';

const FilterElement = ({ title, id, filterPage }) => (
  <Menu.Item name={id} onClick={filterPage} >
    <T value={title} />
  </Menu.Item>
);

FilterElement.propTypes = {
  id: PropTypes.string.isRequired,
  title: ImmutablePropTypes.map.isRequired,
  filterPage: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ loadIdeas }, dispatch);

const mapStateToProps = createStructuredSelector({
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { element, type } = ownProps;
  const id = element.get('id');

  const title = element.getIn(['attributes', 'title_multiloc']);
//  const { nextPageNumber, nextPageItemCount } = stateProps;
  const filter = dispatchProps.loadIdeas;
  const filterPage = () => filter(true, null, null, { [type]: [id] });
  return { title, id, filterPage, ...ownProps };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(FilterElement);
