import React from 'react';
import { IProjectData } from 'services/projects';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Section, SubSectionTitle } from 'components/admin/Section';
import Continuous from './Continuous';
import Timeline from './Timeline';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

interface Props {
  project: IProjectData;
}

const Granular = ({ project }: Props) => {
  const projectId = project.id;

  return (
    <StyledSection id="e2e-granular-permissions">
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
