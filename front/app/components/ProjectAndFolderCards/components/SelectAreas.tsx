import React, { useState } from 'react';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAreas from 'hooks/useAreas';
import useAppConfiguration from 'hooks/useAppConfiguration';

type SelectAreasProps = {
  onChangeAreas: (areas: string[] | null) => void;
};

const SelectAreas = ({ onChangeAreas }: SelectAreasProps) => {
  const localize = useLocalize();
  const areas = useAreas();
  const appConfig = useAppConfiguration();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const handleOnChange = (selectedAreas: string[]) => {
    setSelectedAreas(selectedAreas);
    onChangeAreas(selectedAreas);
  };

  const areasOptions = (): { text: string; value: string }[] => {
    if (!isNilOrError(areas)) {
      return areas.data.map((area) => ({
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
      mobileLeft="-5px"
    />
  );
};

export default SelectAreas;
