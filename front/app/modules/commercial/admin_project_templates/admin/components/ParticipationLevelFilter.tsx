import React, { memo, useCallback, useState } from 'react';

import { WrappedComponentProps } from 'react-intl';

import useLocalize from 'hooks/useLocalize';

import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

import { injectIntl } from 'utils/cl-intl';

import useParticipationLevels from '../api/useParticipationLevels';

import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const ParticipationlevelFilter = memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const { data: participationLevels } = useParticipationLevels();

    let options: IFilterSelectorValue[] = [];

    if (participationLevels) {
      options = participationLevels.map((participationLevel) => ({
        value: participationLevel.id,
        text: localize(participationLevel.titleMultiloc),
      }));
    }

    const handleOnChange = useCallback((selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onChange(selectedValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <FilterSelector
        title={formatMessage(messages.participationLevels)}
        name={formatMessage(messages.participationLevels)}
        selected={selectedValues}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
        last={false}
        left="-5px"
        mobileLeft="-5px"
      />
    );
  }
);

export default injectIntl(ParticipationlevelFilter);
