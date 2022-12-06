import React, { memo, useState } from 'react';
// hooks
import useProjectAllowedInputTopics from 'hooks/useProjectAllowedInputTopics';
import useTopics from 'hooks/useTopics';
// services
import { getTopicIds } from 'services/projectAllowedInputTopics';
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
// components
import FilterSelector from 'components/FilterSelector';
import messages from './messages';

interface Props {
  alignment: 'left' | 'right';
  onChange: (value: any) => void;
  projectId: string;
}

const TopicFilterDropdown = memo(
  ({ alignment, projectId, onChange, localize }: Props & InjectedLocalized) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const allowedInputTopics = useProjectAllowedInputTopics(projectId);

    const topicIds = getTopicIds(allowedInputTopics);
    const topics = useTopics({ topicIds });

    const handleOnChange = (newSelectedValues) => {
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    };

    const getOptions = () => {
      if (isNilOrError(topics)) return [];

      return topics.map((topic) => ({
        text: localize(topic.attributes.title_multiloc),
        value: topic.id,
      }));
    };

    const options = getOptions();

    if (isNilOrError(allowedInputTopics) || allowedInputTopics.length === 0) {
      return null;
    }

    return (
      <FilterSelector
        id="e2e-idea-filter-selector"
        title={
          <FormattedMessage
            {...messages.topicsTitle}
            key={`topic-title-${Math.floor(Math.random() * 100000000)}`}
          />
        }
        name="topics"
        selected={selectedValues}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
        last={true}
        left={alignment === 'left' ? '-5px' : undefined}
        mobileLeft={alignment === 'left' ? '-5px' : undefined}
        right={alignment === 'right' ? '-5px' : undefined}
        mobileRight={alignment === 'right' ? '-5px' : undefined}
      />
    );
  }
);

export default injectLocalize(TopicFilterDropdown);
