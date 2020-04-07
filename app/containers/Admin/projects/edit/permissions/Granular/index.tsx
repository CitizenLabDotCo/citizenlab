import React, { Component } from 'react';
import { IProjectData } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { StyledSubSectionTitle } from '../.';
import Timeline from './Timeline';
import Continuous from './Continuous';
import { StyledSection } from '../';

interface Props {
  project: IProjectData;
}

class Granular extends Component<Props> {

  render() {
    const { project } = this.props;
    return (
      <StyledSection>
        <StyledSubSectionTitle>
          <FormattedMessage {...messages.granularPermissionsTitle} />
        </StyledSubSectionTitle>
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
