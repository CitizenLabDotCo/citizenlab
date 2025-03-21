import React from 'react';

import { useBreakpoint, colors } from '@citizenlab/cl2-component-library';

import useAreas from 'api/areas/useAreas';

import useAreaTerms from 'hooks/areaTerms/useAreaTerms';
import useLocalize from 'hooks/useLocalize';

import FilterSelector from 'components/FilterSelector';

interface SelectAreasProps {
  selectedAreas: string[];
  onChangeAreas: (areas: string[]) => void;
}

const SelectAreas = ({ selectedAreas, onChangeAreas }: SelectAreasProps) => {
  const localize = useLocalize();
  const { data: areas } = useAreas({ forHomepageFilter: true });
  const isSmallerThanTablet = useBreakpoint('tablet');
  const { areaTerm: capitalizedAreaTerm } = useAreaTerms({ capitalized: true });

  const areasOptions = (): { text: string; value: string }[] => {
    if (areas) {
      return areas.data.map((area) => ({
        text: localize(area.attributes.title_multiloc),
        value: area.id,
      }));
    } else {
      return [];
    }
  };

  const options = areasOptions();

  if (options.length === 0) return null;

  return (
    <FilterSelector
      title={capitalizedAreaTerm}
      name="areas"
      selected={selectedAreas}
      values={options}
      onChange={onChangeAreas}
      multipleSelectionAllowed={true}
      right="-4px"
      mobileLeft={isSmallerThanTablet ? '-4px' : undefined}
      mobileRight={isSmallerThanTablet ? undefined : '-4px'}
      textColor={colors.textSecondary}
    />
  );
};

export default SelectAreas;
