import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 30px;
`;


const AllIdeas = ({ project }) => (
  <StyledContentContainer>
    <IdeaCards filter={{ project: project && project.get('id') }} />
  </StyledContentContainer>
);

AllIdeas.propTypes = {
  project: ImmutablePropTypes.map,
};

export default AllIdeas;

