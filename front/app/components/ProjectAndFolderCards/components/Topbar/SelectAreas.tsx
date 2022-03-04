import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { capitalize } from 'lodash-es';

// components
import FilterSelector from 'components/FilterSelector';

// styling
import { colors } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAreas from 'hooks/useAreas';
import useAppConfiguration from 'hooks/useAppConfiguration';

// services
import { coreSettings } from 'services/appConfiguration';

interface SelectAreasProps {
  onChangeAreas: (areas: string[]) => void;
}

const SelectAreas = ({
  onChangeAreas,
  intl: { formatMessage },
}: SelectAreasProps & InjectedIntlProps) => {
  const localize = useLocalize();
  const areas = useAreas({ forHomepageFilter: true });
  const appConfig = useAppConfiguration();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const smallerThanMinTablet = useBreakpoint('smallTablet');

  if (isNilOrError(appConfig)) return null;

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

  const areaTerm = () => {
    const fallback = formatMessage(messages.areaTitle);
    const areaTerm = coreSettings(appConfig).area_term;

    return capitalize(localize(areaTerm, { fallback }));
  };

  const options = areasOptions();

  if (options.length === 0) return null;

  const title = areaTerm();

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

export default injectIntl(SelectAreas);
