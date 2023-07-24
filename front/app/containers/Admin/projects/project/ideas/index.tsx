// Libraries
import React from 'react';
import styled from 'styled-components';
import messages from '../messages';
import { useParams } from 'react-router-dom';

// Utils
import { FormattedMessage } from 'utils/cl-intl';

// Components
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import PostManager, { TFilterMenu } from 'components/admin/PostManager';

// resources
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import AnalysisBanner from './AnalysisBanner';

const StyledDiv = styled.div`
  margin-bottom: 30px;
`;

const AdminProjectIdeas = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

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

      <AnalysisBanner />
      {project && (
        <PostManager
          type="ProjectIdeas"
          projectId={project.data.id}
          phases={phases?.data}
          visibleFilterMenus={
            project.data.attributes.process_type === 'timeline'
              ? timelineProjectVisibleFilterMenus
              : continuousProjectVisibleFilterMenus
          }
          defaultFilterMenu={
            project.data.attributes.process_type === 'timeline'
              ? defaultTimelineProjectVisibleFilterMenu
              : defaultContinuousProjectVisibleFilterMenu
          }
        />
      )}
    </>
  );
};

export default AdminProjectIdeas;
