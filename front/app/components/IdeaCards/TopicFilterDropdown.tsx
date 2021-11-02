import React, { memo, useState, useMemo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// services
import { ITopicData } from 'services/topics';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useTopics from 'hooks/useTopics';

interface Props {
  alignment: 'left' | 'right';
  onChange: (value: any) => void;
  projectId: string | null;
}

const TopicFilterDropdown = memo(
  ({ alignment, projectId, onChange, localize }: Props & InjectedLocalized) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const topics = useTopics(projectId ? { projectId } : {});

    const handleOnChange = (newSelectedValues) => {
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    };

    const getOptions = () => {
      if (!isNilOrError(topics)) {
        const filteredTopics = topics.filter(
          (topic) => !isNilOrError(topic)
        ) as ITopicData[];

        return filteredTopics.map((topic) => {
          return {
            text: localize(topic.attributes.title_multiloc),
            value: topic.id,
          };
        });
      }

      return [];
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const options = useMemo(() => getOptions(), [topics]);

    if (options && options.length > 0) {
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

    return null;
  }
);

export default injectLocalize(TopicFilterDropdown);
