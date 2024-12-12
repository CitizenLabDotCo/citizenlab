import React, { useState } from 'react';

import {
  Button,
  Icon,
  Box,
  Dropdown,
  colors,
} from '@citizenlab/cl2-component-library';

import { IAreas } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

import AreasList from './AreasList';

interface Props {
  selectedAreaId?: string;
  areas: IAreas;
  onSelectArea: (areaId: string) => void;
}

const DropdownSelect = ({ selectedAreaId, areas, onSelectArea }: Props) => {
  const localize = useLocalize();
  const [opened, setOpened] = useState(false);

  const toggleDropdown = () => {
    setOpened((opened) => !opened);
  };

  const selectedArea = selectedAreaId
    ? areas.data.find((area) => area.id === selectedAreaId)
    : undefined;

  return (
    <Box position="relative">
      <Button
        buttonStyle="text"
        textColor={colors.textSecondary}
        onClick={toggleDropdown}
      >
        <Box display="flex" alignItems="center">
          {selectedArea ? (
            <>{localize(selectedArea.attributes.title_multiloc)}</>
          ) : (
            <>Select </>
          )}
          <Icon name="chevron-down" fill={colors.textSecondary} height="20px" />
        </Box>
      </Button>
      <Dropdown
        opened={opened}
        content={<AreasList areas={areas} onClickArea={onSelectArea} />}
        right="20px"
        width="180px"
        mobileWidth="160px"
        onClickOutside={toggleDropdown}
      />
    </Box>
  );
};

export default DropdownSelect;
