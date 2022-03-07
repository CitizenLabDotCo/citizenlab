import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { capitalize } from 'lodash-es';

// components
import FilterSelector from 'components/FilterSelector';

// styling
import { colors } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useTopics from 'hooks/useTopics';
import useAppConfiguration from 'hooks/useAppConfiguration';

// services
import { coreSettings } from 'services/appConfiguration';

interface SelectTopicsProps {
  className?: string;
  onChangeTopics: (topics: string[]) => void;
}

const SelectTopics = ({
  className,
  onChangeTopics,
  intl: { formatMessage },
}: SelectTopicsProps & InjectedIntlProps) => {
  const localize = useLocalize();
  const topics = useTopics({ for_homepage_filter: true });
  const appConfig = useAppConfiguration();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const smallerThanMinTablet = useBreakpoint('smallTablet');

  if (isNilOrError(appConfig)) return null;

  const handleOnChange = (selectedTopics: string[]) => {
    setSelectedTopics(selectedTopics);
    onChangeTopics(selectedTopics);
  };

  const topicsOptions = (): { text: string; value: string }[] => {
    if (!isNilOrError(topics)) {
      return topics.map((topic) => ({
        text: localize(topic.attributes.title_multiloc),
        value: topic.id,
      }));
    } else {
      return [];
    }
  };

  const topicTerm = () => {
    const fallback = formatMessage(messages.topicTitle);
    const topicTerm = coreSettings(appConfig).topic_term;

    return capitalize(localize(topicTerm, { fallback }));
  };

  const options = topicsOptions();

  if (options.length === 0) return null;

  const title = topicTerm();

  return (
    <FilterSelector
      title={title}
      className={className}
      name="topics"
      selected={selectedTopics}
      values={options}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
      right="-5px"
      mobileLeft={smallerThanMinTablet ? '-5px' : undefined}
      mobileRight={smallerThanMinTablet ? undefined : '-5px'}
      textColor={colors.label}
    />
  );
};

export default injectIntl(SelectTopics);
