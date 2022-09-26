import React from 'react';
import { IProjectData } from 'services/projects';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// components
import Timeline from './Timeline';
import Continuous from './Continuous';
import { Section, SubSectionTitle } from 'components/admin/Section';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

interface Props {
  project: IProjectData;
}

const Granular = ({ project }: Props) => {
  const projectId = project.id;

  return (
    <StyledSection>
      <SubSectionTitle>
        <FormattedMessage {...messages.granularPermissionsTitle} />
      </SubSectionTitle>
      {project && project.attributes.process_type === 'timeline' && (
        <Timeline projectId={projectId} />
      )}
      {project && project.attributes.process_type === 'continuous' && (
        <Continuous projectId={projectId} />
      )}
    </StyledSection>
  );
};

export default Granular;
