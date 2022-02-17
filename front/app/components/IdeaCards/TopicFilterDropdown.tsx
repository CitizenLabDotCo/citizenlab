import React, { memo, useState, useMemo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useProjectAllowedInputTopics from 'hooks/useProjectAllowedInputTopics';

interface Props {
  alignment: 'left' | 'right';
  onChange: (value: any) => void;
  projectId: string;
}

const TopicFilterDropdown = memo(
  ({ alignment, projectId, onChange, localize }: Props & InjectedLocalized) => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const allowedInputTopics = useProjectAllowedInputTopics(projectId);

    const handleOnChange = (newSelectedValues) => {
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    };

    const getOptions = () => {
      if (isNilOrError(allowedInputTopics)) return [];

      return allowedInputTopics.map(({ topicData }) => ({
        text: localize(topicData.attributes.title_multiloc),
        value: topicData.id,
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
