import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormSectionTitle } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';

import ConsentGroup from './ConsentGroup';
import {
  ConsentGroupView,
  ToggleConsentHandler,
  ToggleGroupHandler,
} from './typings';

interface Props {
  titleMessage: MessageDescriptor;
  subtitleMessage: MessageDescriptor;
  groups: ConsentGroupView[];
  onToggleGroup: ToggleGroupHandler;
  onToggleConsent: ToggleConsentHandler;
}

const ChannelConsentSection = ({
  titleMessage,
  subtitleMessage,
  groups,
  onToggleGroup,
  onToggleConsent,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      mb="20px"
      role="group"
      aria-label={`${formatMessage(titleMessage)}. ${formatMessage(
        subtitleMessage
      )}`}
    >
      <FormSectionTitle
        message={titleMessage}
        subtitleMessage={subtitleMessage}
      />
      {groups.map((group) => (
        <ConsentGroup
          key={group.id}
          group={group}
          onToggleGroup={onToggleGroup}
          onToggleConsent={onToggleConsent}
        />
      ))}
    </Box>
  );
};

export default ChannelConsentSection;
