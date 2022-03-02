import React from 'react';

// hooks
import useTopics from 'hooks/useTopics';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import TopicsPicker from 'components/UI/TopicsPicker';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  selectedTopicIds: string[];
  onChange: (topicsIds: string[]) => void;
}

const TopicInputs = ({ selectedTopicIds, onChange }: Props) => {
  const availableTopics = useTopics();

  if (isNilOrError(availableTopics)) return null;

  return (
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
      <TopicsPicker
        availableTopics={availableTopics}
        selectedTopicIds={selectedTopicIds}
        onChange={onChange}
      />
    </StyledSectionField>
  );
};

export default TopicInputs;
