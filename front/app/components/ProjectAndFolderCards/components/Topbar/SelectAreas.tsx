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
import useAreas from 'api/areas/useAreas';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// services
import { coreSettings } from 'api/app_configuration/utils';

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
  const { data: areas } = useAreas({ forHomepageFilter: true });
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanTablet = useBreakpoint('tablet');

  if (isNilOrError(appConfig)) return null;

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

  const areaTerm = () => {
    const fallback = formatMessage(messages.areaTitle);
    const areaTerm = coreSettings(appConfig.data).area_term;

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
      mobileLeft={isSmallerThanTablet ? '-4px' : undefined}
      mobileRight={isSmallerThanTablet ? undefined : '-4px'}
      textColor={colors.textSecondary}
    />
  );
};

export default injectIntl(SelectAreas);
