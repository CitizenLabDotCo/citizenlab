// TODO responsible for checking the project is a poll and if so showing the form
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import PollForm from '../PollForm';

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
  <GetProject slug={props.params.slug}>
    {(project) => {
      if (
        !isNilOrError(project) &&
        project.attributes.participation_method === 'poll'
        // phase.attributes.poll_questions TODO
      ) {
        return (
          <>
            <StyledContentContainer className="e2e-continuous-project-poll-container">
                <PollForm
                  // TODO
                />
            </StyledContentContainer>
          </>
        );
      }

      return null;
    }}
  </GetProject>
));
