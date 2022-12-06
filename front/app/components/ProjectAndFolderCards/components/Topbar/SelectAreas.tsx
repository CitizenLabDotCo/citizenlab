import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { capitalize } from 'lodash-es';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useAreas from 'hooks/useAreas';
// hooks
import useLocalize from 'hooks/useLocalize';
// services
import { coreSettings } from 'services/appConfiguration';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
// styling
import { colors } from 'utils/styleUtils';
// components
import FilterSelector from 'components/FilterSelector';
import messages from './messages';

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
