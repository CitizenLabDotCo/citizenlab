import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Header from '../Header';
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';
import Warning from 'components/UI/Warning';

// resources
import GetProject from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import adminMessages from '../../Admin/pages/messages';

// style
import styled from 'styled-components';

const IdeasContainer = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;
`;

const IdeasTitle = styled.h1`
  color: #333;
  font-size: ${fontSizes.xxxl}px;
  line-height: 35px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 30px;
`;

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 15px;
`;

interface InputProps {}

export default withRouter<InputProps>((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => {
      if (!isNilOrError(project)) {

        if (project.attributes.process_type !== 'continuous') {
          // redirect
          clHistory.push(`/projects/${props.params.slug}`);
        }

        return (
          <>
            <Header projectSlug={props.params.slug} />

            <ProjectModeratorIndicator projectId={project.id} />

            {project.attributes.publication_status === 'archived' &&
              <StyledContentContainer>
                <Warning text={<FormattedMessage {...adminMessages.archivedProject} />} />
              </StyledContentContainer>
            }

            <IdeasContainer>
              <ContentContainer>
                <IdeasTitle>
                  <FormattedMessage {...messages.navIdeas} />
                </IdeasTitle>
                <IdeaCards
                  type="load-more"
                  sort="trending"
                  pageSize={12}
                  projectId={project.id}
                  showViewToggle={true}
                  defaultView={(project.attributes.presentation_mode || null)}
                />
              </ContentContainer>
            </IdeasContainer>

            <EventsPreview projectId={project.id} />
          </>
        );
      }

      return null;
    }}
  </GetProject>
));
