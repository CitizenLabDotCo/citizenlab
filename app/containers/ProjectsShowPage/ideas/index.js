import React from 'react';
import PropTypes from 'prop-types';
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';

// import ActionButton from 'components/buttons/action.js';
// import IdeasBorad from 'containers/IdeasIndexPage/pageView';


const AllIdeas = ({ params }) => (
  <ContentContainer>
    <IdeaCards filter={{ project: params.projectId }} />
  </ContentContainer>
);

AllIdeas.propTypes = {
  params: PropTypes.object.isRequired,
};

export default AllIdeas;

