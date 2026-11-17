import React from 'react';

import { Selection } from 'react-aria-components';

import Menu, { MenuItem } from 'design-system/Menu';

import useAreas from 'api/areas/useAreas';

import useLocalize from 'hooks/useLocalize';

interface Props {
  'aria-label': string;
  areaIds: string[];
  onChange: (areaIds: string[]) => void;
}

const AreaFlyout = ({ 'aria-label': ariaLabel, areaIds, onChange }: Props) => {
  const localize = useLocalize();
  const { data: areas } = useAreas({});
  const areaList = areas?.data ?? [];

  const handleSelectionChange = (keys: Selection) => {
    onChange(
      keys === 'all'
        ? areaList.map((area) => area.id)
        : Array.from(keys, String)
    );
  };

  return (
    <Menu
      aria-label={ariaLabel}
      selectionMode="multiple"
      selectedKeys={new Set(areaIds)}
      onSelectionChange={handleSelectionChange}
    >
      {areaList.map((area) => {
        return (
          <MenuItem key={area.id} id={area.id}>
            {localize(area.attributes.title_multiloc)}
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default AreaFlyout;
