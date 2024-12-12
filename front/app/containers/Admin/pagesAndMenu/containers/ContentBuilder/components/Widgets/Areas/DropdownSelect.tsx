import React, { useState, useMemo } from 'react';

import { Button, Icon, Box, colors } from '@citizenlab/cl2-component-library';

import { IAreaData, IAreas } from 'api/areas/types';

import useLocalize from 'hooks/useLocalize';

interface Props {
  selectedAreaIds: string[];
  areas: IAreas;
}

const DropdownSelect = ({ selectedAreaIds, areas }: Props) => {
  const localize = useLocalize();
  const [opened, setOpened] = useState(false);

  const selectedAreas = useMemo(() => {
    const areasById = areas.data.reduce(
      (acc, area) => ({ ...acc, [area.id]: area }),
      {} as Record<string, IAreaData>
    );
    return selectedAreaIds.map((id) => areasById[id]);
  }, [selectedAreaIds, areas]);

  return (
    <Button buttonStyle="text" textColor={colors.textSecondary}>
      <Box display="flex" alignItems="center">
        {selectedAreas.length === 0 && <>Select an area</>}
        {selectedAreas.length === 1 && (
          <>{localize(selectedAreas[0].attributes.title_multiloc)}</>
        )}
        {selectedAreas.length > 1 && <>Selection ({selectedAreas.length})</>}
        <Icon name="chevron-down" fill={colors.textSecondary} height="20px" />
      </Box>
    </Button>
  );
};

export default DropdownSelect;
