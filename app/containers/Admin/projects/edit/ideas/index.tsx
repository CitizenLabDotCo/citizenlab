// Libraries
import React from 'react';
import styled from 'styled-components';
import messages from '../messages';
import { adopt } from 'react-adopt';

// Utils
import { FormattedMessage } from 'utils/cl-intl';

// Resources
// import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import IdeaManager from 'components/admin/IdeaManager';

// resources
// import GetProject from 'resources/GetProject';
import { IProjectData } from 'services/projects';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

interface InputProps {}

interface DataProps {
  // phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {
  // When the IdeaManager is used in admin/projects,
  // the project is loaded through the router inside the parent component (Admin/projects/edit/index.tsx)
  // In this parent component, project gets loaded and passed to all childRoutes (child components), including admin/projects/edit/ideas
  // Search this parent component for 'React.cloneElement' to see how this project prop is passed.
  project: IProjectData | null;
}

interface State {}

export default class AdminProjectIdeas extends React.PureComponent<Props, State> {

  render() {
    const { project } = this.props;

    return (
      <>
        <StyledDiv>
          <SectionTitle>
            <FormattedMessage {...messages.titleIdeas} />
          </SectionTitle>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleIdeas} />
          </SectionSubtitle>
        </StyledDiv>

        <IdeaManager project={project} />

      </>
    );
  }
}

// const Data = adopt<Props>({
//   phases: ({ params, render }) => <GetPhases projectId={params.projectId}>{render}</GetPhases>
// });
//
// export default () => (
//   <Data>
//     {dataProps => <AdminProjectIdeas{...dataProps} />}
//   </Data>
// );
