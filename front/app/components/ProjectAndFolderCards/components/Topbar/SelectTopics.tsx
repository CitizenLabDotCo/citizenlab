import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { capitalize } from 'lodash-es';

// components
import FilterSelector from 'components/FilterSelector';

// styling
import { colors } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useTopics from 'hooks/useTopics';
import useAppConfiguration from 'hooks/useAppConfiguration';

// services
import { coreSettings } from 'services/appConfiguration';

interface SelectTopicsProps {
  className?: string;
  selectedTopics: string[];
  onChangeTopics: (topics: string[]) => void;
}

const SelectTopics = ({
  className,
  selectedTopics,
  onChangeTopics,
  intl: { formatMessage },
}: SelectTopicsProps & WrappedComponentProps) => {
  const localize = useLocalize();
  const topics = useTopics({ forHomepageFilter: true });
  const appConfig = useAppConfiguration();
  const smallerThanMinTablet = useBreakpoint('tablet');

  if (isNilOrError(appConfig)) return null;

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
      onChange={onChangeTopics}
      multipleSelectionAllowed={true}
      right="-4px"
      mobileLeft={smallerThanMinTablet ? '-4px' : undefined}
      mobileRight={smallerThanMinTablet ? undefined : '-4px'}
      textColor={colors.textSecondary}
    />
  );
};

export default injectIntl(SelectTopics);
