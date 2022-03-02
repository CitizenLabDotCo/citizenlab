import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
// import TopicsPicker from 'components/UI/TopicsPicker';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const TopicInputs = () => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.areasLabel} />
      <IconTooltip
        content={
          <FormattedMessage
            {...messages.areasLabelTooltip}
            values={{
              areasLabelTooltipLink: (
                <Link to="/admin/settings/areas">
                  <FormattedMessage {...messages.areasLabelTooltipLinkText} />
                </Link>
              ),
            }}
          />
        }
      />
    </SubSectionTitle>
    {/* <TopicsPicker /> */}
  </StyledSectionField>
);

export default TopicInputs;
