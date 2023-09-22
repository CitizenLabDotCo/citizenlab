import React from 'react';

// services
import { coreSettings } from 'api/app_configuration/utils';

// hooks
import useTopics from 'api/topics/useTopics';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import TopicsPicker from 'components/UI/TopicsPicker';
import TopicInputsTooltipExtraCopy from './TopicInputsTooltipExtraCopy';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// utils

interface Props {
  selectedTopicIds: string[];
  onChange: (topicsIds: string[]) => void;
}

const TopicInputs = ({ selectedTopicIds, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: availableTopics } = useTopics({});
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  if (!availableTopics || !appConfiguration) {
    return null;
  }

  const { topics_term } = coreSettings(appConfiguration.data);
  const topicsCopy = getTopicsCopy(
    formatMessage(messages.topicsLabel),
    localize(topics_term)
  );

  return (
    <StyledSectionField>
      <SubSectionTitle>
        {topicsCopy} &nbsp;
        <IconTooltip
          content={
            <>
              {formatMessage(messages.topicsLabelTooltip, {
                topicsCopy: topicsCopy.toLowerCase(),
              })}
              <TopicInputsTooltipExtraCopy />
            </>
          }
        />
      </SubSectionTitle>
      <TopicsPicker
        availableTopics={availableTopics.data}
        selectedTopicIds={selectedTopicIds}
        onClick={onChange}
      />
    </StyledSectionField>
  );
};

const getTopicsCopy = (message: string, customTerminology: string) => {
  return customTerminology.length > 0
    ? `${message} (${customTerminology})`
    : `${message}`;
};

export default TopicInputs;
