import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { capitalize } from 'lodash-es';

import FilterSelector from 'components/FilterSelector';

import { useBreakpoint, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import messages from './messages';

import useLocalize from 'hooks/useLocalize';
import useTopics from 'api/topics/useTopics';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { coreSettings } from 'api/app_configuration/utils';

interface SelectTopicsProps {
  className?: string;
  selectedTopics: string[];
  onChangeTopics: (topics: string[]) => void;
}

const SelectTopics = ({
  className,
  selectedTopics,
  onChangeTopics,
}: SelectTopicsProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: topics } = useTopics({ forHomepageFilter: true });
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanTablet = useBreakpoint('tablet');

  if (isNilOrError(appConfig)) return null;

  const topicsOptions = (): { text: string; value: string }[] => {
    if (topics) {
      return topics.data.map((topic) => ({
        text: localize(topic.attributes.title_multiloc),
        value: topic.id,
      }));
    } else {
      return [];
    }
  };

  const topicTerm = () => {
    const fallback = formatMessage(messages.topicTitle);
    const topicTerm = coreSettings(appConfig.data).topic_term;

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
      onChange={onChangeTopics}
      multipleSelectionAllowed={true}
      right="-4px"
      mobileLeft={isSmallerThanTablet ? '-4px' : undefined}
      mobileRight={isSmallerThanTablet ? undefined : '-4px'}
      textColor={colors.textSecondary}
    />
  );
};

export default SelectTopics;
