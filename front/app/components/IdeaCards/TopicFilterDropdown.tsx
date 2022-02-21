import React, { memo, useState, useMemo } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// services
import { getTopicIds } from 'services/projectAllowedInputTopics';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useProjectAllowedInputTopics from 'hooks/useProjectAllowedInputTopics';
import useTopics from 'hooks/useTopics';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  alignment: 'left' | 'right';
  onChange: (value: any) => void;
  projectId: string;
}

const TopicFilterDropdown = memo(
  ({ alignment, projectId, onChange, localize }: Props & InjectedLocalized) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const allowedInputTopics = useProjectAllowedInputTopics(projectId);

    const allowedInputTopicIds = useMemo(
      () => getTopicIds(allowedInputTopics),
      [allowedInputTopics]
    );

    const topics = useTopics({ topicIds: allowedInputTopicIds });

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

    const options = useMemo(getOptions, [allowedInputTopics]);

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
