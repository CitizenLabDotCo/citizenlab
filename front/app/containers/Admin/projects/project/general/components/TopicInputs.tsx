import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useTopics from 'api/topics/useTopics';

import useLocalize from 'hooks/useLocalize';

import { SubSectionTitle } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { StyledSectionField } from './styling';
import TopicInputsTooltipExtraCopy from './TopicInputsTooltipExtraCopy';

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
