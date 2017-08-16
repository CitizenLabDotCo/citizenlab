import React from 'react';
import PropTypes from 'prop-types';
import IdeaCards from 'components/IdeaCards';

// import ActionButton from 'components/buttons/action.js';
// import IdeasBorad from 'containers/IdeasIndexPage/pageView';


const AllIdeas = ({ params }) => (
  <IdeaCards filter={{ project: params.projectId }} />
);

AllIdeas.propTypes = {
  params: PropTypes.object.isRequired,
};

export default AllIdeas;

