import React from 'react';

// services
import { coreSettings } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';
import useTopics from 'hooks/useTopics';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import Outlet from 'components/Outlet';
import TopicsPicker from 'components/UI/TopicsPicker';
import { StyledSectionField } from './styling';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  selectedTopicIds: string[];
  onChange: (topicsIds: string[]) => void;
}

const TopicInputs = ({
  selectedTopicIds,
  onChange,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const availableTopics = useTopics();
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  if (isNilOrError(availableTopics) || isNilOrError(appConfiguration)) {
    return null;
  }

  const { topics_term } = coreSettings(appConfiguration);
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
              <Outlet id="app.containers.Admin.projects.edit.general.components.TopicInputs.tooltipExtraCopy" />
            </>
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

const getTopicsCopy = (message: string, customTerminology: string) => {
  return customTerminology.length > 0
    ? `${message} (${customTerminology})`
    : `${message}`;
};

export default injectIntl(TopicInputs);
