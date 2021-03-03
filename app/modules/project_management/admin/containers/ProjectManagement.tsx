import React from 'react';
import styled from 'styled-components';

// components
import { Section } from 'components/admin/Section';
import Moderators from '../components/Moderators';

const ModeratorSubSection = styled(Section)`
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
}

const ProjectManagement = ({ projectId }: Props) => {
  return (
    <ModeratorSubSection>
      <Moderators projectId={projectId} />
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
