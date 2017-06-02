import React from 'react';
import PropTypes from 'prop-types';

// import ActionButton from 'components/buttons/action.js';
import IdeasBorad from 'containers/IdeasIndexPage/pageView';


const AllIdeas = ({ params }) => (
  <IdeasBorad filter={{ project: params.projectId }} />
);

AllIdeas.propTypes = {
  params: PropTypes.object.isRequired,
};

export default AllIdeas;

