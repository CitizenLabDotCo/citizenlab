import React, { useState } from 'react';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAreas from 'hooks/useAreas';
import useAppConfiguration from 'hooks/useAppConfiguration';

interface SelectAreasProps {
  onChangeAreas: (areas: string[]) => void;
}

const SelectAreas = ({ onChangeAreas }: SelectAreasProps) => {
  const localize = useLocalize();
  const areas = useAreas();
  const appConfig = useAppConfiguration();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const smallerThanMinTablet = useBreakpoint('smallTablet');

  const handleOnChange = (selectedAreas: string[]) => {
    setSelectedAreas(selectedAreas);
    onChangeAreas(selectedAreas);
  };

  const areasOptions = (): { text: string; value: string }[] => {
    if (!isNilOrError(areas)) {
      return areas.map((area) => ({
        text: localize(area.attributes.title_multiloc),
        value: area.id,
      }));
    } else {
      return [];
    }
  };

  const areasTerm = () => {
    if (!isNilOrError(appConfig)) {
      const customTerm = appConfig.data.attributes.settings.core.areas_term;
      if (customTerm && !isEmptyMultiloc(customTerm)) {
        return localize(customTerm);
      } else {
        return <FormattedMessage {...messages.areasTitle} />;
      }
    } else {
      return <FormattedMessage {...messages.areasTitle} />;
    }
  };

  const options = areasOptions();

  if (options.length === 0) return null;

  const title = areasTerm();

  return (
    <FilterSelector
      title={title}
      name="areas"
      selected={selectedAreas}
      values={options}
      onChange={handleOnChange}
      multipleSelectionAllowed={true}
      right="-5px"
      mobileLeft={smallerThanMinTablet ? '-5px' : undefined}
      mobileRight={smallerThanMinTablet ? undefined : '-5px'}
      textColor={colors.label}
    />
  );
};

export default SelectAreas;
