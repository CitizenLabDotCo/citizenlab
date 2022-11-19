import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { capitalize } from 'lodash-es';

// components
import FilterSelector from 'components/FilterSelector';

// styling
import { colors } from 'utils/styleUtils';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAreas from 'hooks/useAreas';
import useAppConfiguration from 'hooks/useAppConfiguration';

// services
import { coreSettings } from 'services/appConfiguration';

interface SelectAreasProps {
  selectedAreas: string[];
  onChangeAreas: (areas: string[]) => void;
}

const SelectAreas = ({
  selectedAreas,
  onChangeAreas,
  intl: { formatMessage },
}: SelectAreasProps & WrappedComponentProps) => {
  const localize = useLocalize();
  const areas = useAreas({ forHomepageFilter: true });
  const appConfig = useAppConfiguration();
  const smallerThanMinTablet = useBreakpoint('tablet');

  if (isNilOrError(appConfig)) return null;

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
      onChange={onChangeAreas}
      multipleSelectionAllowed={true}
      right="-4px"
      mobileLeft={smallerThanMinTablet ? '-4px' : undefined}
      mobileRight={smallerThanMinTablet ? undefined : '-4px'}
      textColor={colors.textSecondary}
    />
  );
};

export default injectIntl(SelectAreas);
