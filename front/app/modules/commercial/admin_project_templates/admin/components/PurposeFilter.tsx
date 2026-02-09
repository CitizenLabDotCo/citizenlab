import React, { memo, useCallback, useState } from 'react';

import { WrappedComponentProps } from 'react-intl';

import useLocalize from 'hooks/useLocalize';

import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

import { injectIntl } from 'utils/cl-intl';

import usePurposes from '../api/usePurposes';

import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const PurposeFilter = memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const { data: purposes } = usePurposes();

    let options: IFilterSelectorValue[] = [];

    if (purposes) {
      options = purposes.map((purpose) => ({
        value: purpose.id,
        text: localize(purpose.titleMultiloc),
      }));
    }

    const handleOnChange = useCallback((selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onChange(selectedValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <FilterSelector
        title={formatMessage(messages.purposes)}
        name={formatMessage(messages.purposes)}
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

export default injectIntl(PurposeFilter);
