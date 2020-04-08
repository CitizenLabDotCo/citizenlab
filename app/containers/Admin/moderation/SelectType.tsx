import React, { memo, useState, useCallback } from 'react';
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { TModeratableTypes } from 'services/moderations';

interface Props {
  onChange: (newModeratableType: TModeratableTypes[]) => void;
}

const SelectType = memo(({ onChange }: Props) => {
  const [selectedTypes, setSelectedTypes] = useState<TModeratableTypes[]>([]);
  const handleOnChange = useCallback((newSelectedTypes: TModeratableTypes[]) => {
    setSelectedTypes(newSelectedTypes);
    onChange(newSelectedTypes);
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
