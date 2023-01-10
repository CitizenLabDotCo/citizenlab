import React from 'react';

// components
import TerminologyConfig from 'components/admin/TerminologyConfig';

// resources
import { updateAppConfiguration } from 'services/appConfiguration';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  className?: string;
}

const TopicTermConfig = ({ className }: Props) => {
  const appConfiguration = useAppConfiguration();
  if (isNilOrError(appConfiguration)) return null;

  const save = async ({ singular, plural }) => {
    await updateAppConfiguration({
      settings: {
        core: {
          topic_term: singular,
          topics_term: plural,
        },
      },
    });
  };

  const { topic_term, topics_term } = appConfiguration.attributes.settings.core;

  return (
    <TerminologyConfig
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
