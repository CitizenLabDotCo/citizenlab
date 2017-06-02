import React from 'react';
import PropTypes from 'prop-types';

// import ActionButton from 'components/buttons/action.js';
// import IdeasBorad from 'containers/IdeasIndexPage/pageView';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import T from 'containers/T';


const AllIdeas = ({ title, description }) => (
  <div>
    <h2> <T value={title} /> </h2>
    <p> <T value={description} /> </p>
  </div>
);

AllIdeas.propTypes = {
  params: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  title: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes', 'title_multiloc']),
  description: (state, { params }) => state.getIn(['resources', 'projects', params.projectId, 'attributes', 'description_multiloc']),
});

export default connect(mapStateToProps)(AllIdeas);

