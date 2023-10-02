import React from 'react';

// components
import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledWarning } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  projectType: 'continuous' | 'timeline';
  handleProjectTypeOnChange: (projectType: 'continuous' | 'timeline') => void;
}

export default ({ projectType, handleProjectTypeOnChange }: Props) => (
  <>
    <SubSectionTitle>
      <FormattedMessage {...messages.projectTypeTitle} />
      <IconTooltip
        content={<FormattedMessage {...messages.projectTypeTooltip} />}
      />
    </SubSectionTitle>
    <StyledWarning>
      <FormattedMessage {...messages.projectTypeWarning} />
    </StyledWarning>
    <Radio
      className="e2e-project-type-timeline"
      onChange={handleProjectTypeOnChange}
      currentValue={projectType}
      value="timeline"
      name="projecttype"
      id="projectype-timeline"
      label={<FormattedMessage {...messages.timeline} />}
    />
    <Radio
      className="e2e-project-type-continuous"
      onChange={handleProjectTypeOnChange}
      currentValue={projectType}
      value="continuous"
      name="projecttype"
      id="projectype-continuous"
      label={<FormattedMessage {...messages.continuous} />}
    />
  </>
);
