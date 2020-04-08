import React, { memo, useState, useCallback } from 'react';
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const SelectType = memo(() => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleOnChange = useCallback((selectedTypes: string[]) => {
    setSelectedTypes((selectedTypes || []));
  }, []);

  return (
    <FilterSelector
      title={'Type'}
      name="type"
      selected={selectedTypes}
      values={[{
        text: <FormattedMessage {...messages.comment} />,
        value: 'Comment'
      },
      {
        text: <FormattedMessage {...messages.idea} />,
        value: 'Idea'
      },
      {
        text: <FormattedMessage {...messages.initiative} />,
        value: 'Initiative'
      }]}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
    />
  );
});

export default SelectType;
