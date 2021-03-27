// Libraries
import React from 'react';
import styled from 'styled-components';
import messages from '../messages';
import { adopt } from 'react-adopt';

// Utils
import { FormattedMessage } from 'utils/cl-intl';

// Resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PostManager from 'components/admin/PostManager';

// resources
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

interface InputProps {}

interface DataProps {
  phases: GetPhasesChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AdminProjectIdeas extends React.PureComponent<
  Props & WithRouterProps,
  State
> {
  render() {
    const { project, phases } = this.props;

    return (
      <>
        <StyledDiv>
          <SectionTitle>
            <FormattedMessage {...messages.titleInputManager} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.subtitleInputManager} />
          </SectionDescription>
        </StyledDiv>

        {!isNilOrError(project) && (
          <PostManager
            type="ProjectIdeas"
            projectId={project.id}
            phases={phases}
            visibleFilterMenus={
              project && project.attributes.process_type === 'timeline'
                ? ['phases', 'statuses', 'topics']
                : ['statuses', 'topics']
            }
          />
        )}
      </>
    );
  }
}

const Data = withRouter(
  adopt<Props>({
    phases: ({ params, render }) => (
      <GetPhases projectId={params.projectId}>{render}</GetPhases>
    ),
    project: ({ params, render }) => (
      <GetProject projectId={params.projectId}>{render}</GetProject>
    ),
  })
);

export default () => (
  <Data>{(dataProps) => <AdminProjectIdeas {...dataProps} />}</Data>
);
