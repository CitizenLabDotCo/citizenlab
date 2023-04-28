import React from 'react';
import { IOption } from 'typings';
import { Select } from '@citizenlab/cl2-component-library';
import useAreas from 'api/areas/useAreas';
import useLocalize from 'hooks/useLocalize';

type Props = {
  value: string;
  onChange: (areaValue: string) => void;
};

const AreaValueSelector = ({ value, onChange }: Props) => {
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

  const handleOnChange = (option: IOption) => {
    onChange(option.value);
  };

  return (
    <Select
      value={value}
      options={generateOptions()}
      onChange={handleOnChange}
    />
  );
};

export default AreaValueSelector;
