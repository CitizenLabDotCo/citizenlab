import React, { memo, useCallback } from 'react';
// services
import { TModeratableType } from '../../services/moderations';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import FilterSelector from 'components/FilterSelector';
import messages from './messages';

interface Props {
  onChange: (newModeratableType: TModeratableType[]) => void;
  selectedTypes: TModeratableType[];
}

const SelectType = memo(({ onChange, selectedTypes }: Props) => {
  const handleOnChange = useCallback((newSelectedTypes: TModeratableType[]) => {
    onChange(newSelectedTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FilterSelector
      title={<FormattedMessage {...messages.type} />}
      name="type"
      selected={selectedTypes}
      values={[
        {
          text: <FormattedMessage {...messages.comment} />,
          value: 'Comment',
        },
        {
          text: <FormattedMessage {...messages.post} />,
          value: 'Idea',
        },
        {
          text: <FormattedMessage {...messages.initiative} />,
          value: 'Initiative',
        },
      ]}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
    />
  );
});

export default SelectType;
