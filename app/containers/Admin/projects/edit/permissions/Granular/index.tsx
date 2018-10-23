import React, { Component } from 'react';
import styled from 'styled-components';
import { IProjectData } from 'services/projects';

import { Section, SectionTitle } from 'components/admin/Section';
import Timeline from './Timeline';
import Continuous from './Continuous';
import Warning from 'components/UI/Warning';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledWarning = styled(Warning)`
  margin-bottom: 30px;
`;

const StyledSection = styled(Section)`
margin-bottom: 110px;
`;

interface Props {
  project: IProjectData;
}

class Granular extends Component<Props> {

  render() {
    const { project } = this.props;
    return (
      <StyledSection>
        <SectionTitle>
          <FormattedMessage {...messages.granularPermissionsTitle} />
        </SectionTitle>
        <StyledWarning>
          <FormattedMessage {...messages.engagementWarning} />
        </StyledWarning>
        {project && project.attributes.process_type === 'timeline' &&
          <Timeline
            projectId={project.id}
          />
        }
        {project && project.attributes.process_type === 'continuous' &&
          <Continuous
            project={project}
          />
        }
      </StyledSection>
    );
  }
}

export default Granular;
