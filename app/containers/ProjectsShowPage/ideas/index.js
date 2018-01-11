// Libs
import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

// Components
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import IdeasMap from 'components/IdeasMap';

// Styles
import styled from 'styled-components';
const StyledContentContainer = styled(ContentContainer)`
  margin-top: 30px;
`;


const AllIdeas = ({ project }) => (
  <StyledContentContainer>
    <IdeasMap project={project && project.get('id')} />
    <IdeaCards filter={{ project: project && project.get('id') }} />
  </StyledContentContainer>
);

AllIdeas.propTypes = {
  project: ImmutablePropTypes.map,
};

export default AllIdeas;

