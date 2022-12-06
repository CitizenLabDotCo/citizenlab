// Libraries
import React from 'react';
import { adopt } from 'react-adopt';
// Resources
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
// Utils
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// resources
import { isNilOrError } from 'utils/helperUtils';
import PostManager, { TFilterMenu } from 'components/admin/PostManager';
// Components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import styled from 'styled-components';
import messages from '../messages';

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
    const defaultTimelineProjectVisibleFilterMenu = 'phases';
    const defaultContinuousProjectVisibleFilterMenu = 'statuses';
    const timelineProjectVisibleFilterMenus: TFilterMenu[] = [
      defaultTimelineProjectVisibleFilterMenu,
      'statuses',
      'topics',
    ];
    const continuousProjectVisibleFilterMenus: TFilterMenu[] = [
      defaultContinuousProjectVisibleFilterMenu,
      'topics',
    ];

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
              project.attributes.process_type === 'timeline'
                ? timelineProjectVisibleFilterMenus
                : continuousProjectVisibleFilterMenus
            }
            defaultFilterMenu={
              project.attributes.process_type === 'timeline'
                ? defaultTimelineProjectVisibleFilterMenu
                : defaultContinuousProjectVisibleFilterMenu
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
