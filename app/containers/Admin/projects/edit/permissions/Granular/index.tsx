import React, { Component } from 'react';
import { IProjectData } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { SubSectionTitle } from 'components/admin/Section';
import Timeline from './Timeline';
import Continuous from './Continuous';
import { StyledSection } from '../';

interface Props {
  project: IProjectData;
}

class Granular extends Component<Props> {
  render() {
    const { project } = this.props;
    const projectId = project.id;
    return (
      <StyledSection>
        <SubSectionTitle>
          <FormattedMessage {...messages.granularPermissionsTitleText} />
        </SubSectionTitle>
        {project && project.attributes.process_type === 'timeline' && (
          <Timeline projectId={projectId} />
        )}
        {project && project.attributes.process_type === 'continuous' && (
          <Continuous projectId={projectId} />
        )}
      </StyledSection>
    );
  }
}

export default Granular;
