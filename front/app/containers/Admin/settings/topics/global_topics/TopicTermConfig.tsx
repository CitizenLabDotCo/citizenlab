import React from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import TerminologyConfig from 'components/admin/TerminologyConfig';

import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  className?: string;
}

const TopicTermConfig = ({ className }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: updateAppConfiguration, isLoading } =
    useUpdateAppConfiguration();
  if (isNilOrError(appConfiguration)) return null;

  const save = ({ singular, plural }) => {
    updateAppConfiguration({
      settings: {
        core: {
          topic_term: singular,
          topics_term: plural,
        },
      },
    });
  };

  const { topic_term, topics_term } =
    appConfiguration.data.attributes.settings.core;

  return (
    <TerminologyConfig
      isLoading={isLoading}
      className={className}
      terminologyMessage={messages.subtitleTerminology}
      tooltipMessage={messages.terminologyTooltip}
      singularValueMultiloc={topic_term}
      pluralValueMultiloc={topics_term}
      singularLabelMessage={messages.topicTerm}
      pluralLabelMessage={messages.topicsTerm}
      singularPlaceholderMessage={messages.topicTermPlaceholder}
      pluralPlaceholderMessage={messages.topicsTermPlaceholder}
      onSave={save}
    />
  );
};

export default TopicTermConfig;
