import React, { memo, useCallback, useState } from 'react';

import { WrappedComponentProps } from 'react-intl';

import useLocalize from 'hooks/useLocalize';

import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

import { injectIntl } from 'utils/cl-intl';

import useDepartments from '../api/useDepartments';

import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const DepartmentFilter = memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const { data: departments } = useDepartments();

    let options: IFilterSelectorValue[] = [];

    if (departments) {
      options = departments.map((department) => ({
        value: department.id,
        text: localize(department.titleMultiloc),
      }));
    }

    const handleOnChange = useCallback((selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onChange(selectedValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <FilterSelector
        title={formatMessage(messages.departments)}
        name={formatMessage(messages.departments)}
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

export default injectIntl(DepartmentFilter);
