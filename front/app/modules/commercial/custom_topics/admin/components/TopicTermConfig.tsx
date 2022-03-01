import React, { useState } from 'react';
import { mapValues, lowerCase } from 'lodash-es';

// components
import TerminologyConfig from 'components/admin/TerminologyConfig';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// resources
import { updateAppConfiguration } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc } from 'typings';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getTerm } from 'containers/Admin/settings/areas/all/AreaTermConfig';

interface Props {
  className?: string;
}

const TopicTermConfig = ({
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const appConfiguration = useAppConfiguration();
  const [topicTerm, setTopicTerm] = useState<Multiloc | undefined>(undefined);

  if (isNilOrError(appConfiguration)) return null;

  const save = async () => {
    await updateAppConfiguration({
      settings: {
        core: {
          topic_term: topicTerm,
        },
      },
    });
  };

  const handleTopicChange = (changedTopicTerm: Multiloc) => {
    setTopicTerm(mapValues(changedTopicTerm, lowerCase));
  };

  const { topic_term } = appConfiguration.data.attributes.settings.core;

  return (
    <TerminologyConfig
      className={className}
      terminologyMessage={messages.subtitleTerminology}
      tooltipMessage={messages.terminologyTooltip}
      saveButtonMessage={messages.topicTermSave}
      onSave={save}
    >
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="topic_term"
          label={formatMessage(messages.topicTerm)}
          valueMultiloc={getTerm(topicTerm, topic_term)}
          onChange={handleTopicChange}
          placeholder={formatMessage(messages.topicTermPlaceholder)}
        />
      </SectionField>
    </TerminologyConfig>
  );
};

export default injectIntl(TopicTermConfig);
