import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import PollSection from './PollSection';

// resources
import GetProject from 'resources/GetProject';

// styling
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 50px;
  padding-bottom: 100px;
  background: ${colors.background};

  ${media.smallerThanMinTablet`
    padding-top: 30px;
  `}
`;

export default withRouter((props: WithRouterProps) => (
  <GetProject projectSlug={props.params.slug}>
    {(project) => {
      if (
        !isNilOrError(project) &&
        project.attributes.participation_method === 'poll'
      ) {
        return (
          <>
            <StyledContentContainer className="e2e-continuous-project-poll-container">
              <PollSection
                projectId={project.id}
                type="project"
                phaseId={null}
              />
            </StyledContentContainer>
          </>
        );
      }

      return null;
    }}
  </GetProject>
));
