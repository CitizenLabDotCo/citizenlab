import React from 'react';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import useAreas from 'api/areas/useAreas';
import useLocalize from 'hooks/useLocalize';

export interface Props {
  value: string;
  onChange: (areaIds: string[]) => void;
}

const AreaValuesSelector = ({ value, onChange }: Props) => {
  const { data: areas } = useAreas({});
  const localize = useLocalize();
  const generateOptions = (): IOption[] => {
    if (areas) {
      return areas.data.map((area) => ({
        value: area.id,
        label: localize(area.attributes.title_multiloc),
      }));
    } else {
      return [];
    }
  };

  const handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    onChange(optionIds);
  };

  return (
    <MultipleSelect
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
};

export default AreaValuesSelector;
