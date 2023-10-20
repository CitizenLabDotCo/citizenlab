import React from 'react';

// components
import { IconTooltip, Radio } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import Warning from 'components/UI/Warning';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  projectType: 'continuous' | 'timeline';
}

export default ({ projectType }: Props) => (
  <>
    <SubSectionTitle>
      <FormattedMessage {...messages.projectTypeTitle} />
      <IconTooltip
        content={<FormattedMessage {...messages.projectTypeTooltip} />}
      />
    </SubSectionTitle>
    <Radio
      className="e2e-project-type-timeline"
      currentValue={projectType}
      value="timeline"
      name="projecttype"
      id="projectype-timeline"
      label={<FormattedMessage {...messages.timeline} />}
    />
    <Radio
      className="e2e-project-type-continuous"
      currentValue={projectType}
      disabled
      value="continuous"
      name="projecttype"
      id="projectype-continuous"
      label={<FormattedMessage {...messages.continuous} />}
    />
    <Warning>
      <FormattedMessage {...messages.continousProjectDeprecationMessage} />
    </Warning>
  </>
);
