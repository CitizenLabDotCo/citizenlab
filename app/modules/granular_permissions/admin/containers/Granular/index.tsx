import React, { Component } from 'react';
import { IProjectData } from 'services/projects';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import Timeline from './Timeline';
import Continuous from './Continuous';
import { SubSection, SubSectionTitle } from 'components/admin/Section';

const StyledSubSection = styled(SubSection)`
  margin-bottom: 50px;
`;

interface Props {
  project: IProjectData;
}

const Granular = ({ project }: Props) => {
  const projectId = project.id;

  return (
    <StyledSubSection>
      <SubSectionTitle>
        <FormattedMessage {...messages.granularPermissionsTitle} />
      </SubSectionTitle>
      {project && project.attributes.process_type === 'timeline' && (
        <Timeline projectId={projectId} />
      )}
      {project && project.attributes.process_type === 'continuous' && (
        <Continuous projectId={projectId} />
      )}
    </StyledSubSection>
  );
};

export default Granular;
