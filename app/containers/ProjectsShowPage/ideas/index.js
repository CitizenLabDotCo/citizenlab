import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';

const AllIdeas = ({ project }) => (
  <ContentContainer>
    <IdeaCards filter={{ project: project && project.get('id') }} />
  </ContentContainer>
);

AllIdeas.propTypes = {
  project: ImmutablePropTypes.map,
};

export default AllIdeas;

