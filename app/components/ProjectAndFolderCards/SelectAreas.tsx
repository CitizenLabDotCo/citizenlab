import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, isEmptyMultiloc } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// services
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface InputProps {
  selectedAreas: string[];
  onChange: (value: any) => void;
}

interface DataProps {
  areas: GetAreasChildProps;
  tenant: GetAppConfigurationChildProps;
}

interface Props extends InputProps, DataProps, InjectedLocalized {}

class SelectAreas extends PureComponent<Props> {
  handleOnChange = (selectedAreas: string[]) => {
    this.props.onChange(selectedAreas || []);
  };

  areasOptions = (): { text: string; value: string }[] => {
    const { areas, localize } = this.props;
    if (!isNilOrError(areas)) {
      return areas.map((area) => ({
        text: localize(area.attributes.title_multiloc),
        value: area.id,
      }));
    } else {
      return [];
    }
  };

  areasTerm = () => {
    const { tenant, localize } = this.props;
    if (!isNilOrError(tenant)) {
      const customTerm = tenant.attributes.settings.core.areas_term;
      if (customTerm && !isEmptyMultiloc(customTerm)) {
        return localize(customTerm);
      } else {
        return <FormattedMessage {...messages.areasTitle} />;
      }
    } else {
      return <FormattedMessage {...messages.areasTitle} />;
    }
  };

  render() {
    const { selectedAreas } = this.props;
    const options = this.areasOptions();

    if (options.length === 0) return null;

    const title = this.areasTerm();

    return (
      <FilterSelector
        title={title}
        name="areas"
        selected={selectedAreas}
        values={options}
        onChange={this.handleOnChange}
        multipleSelectionAllowed={true}
        right="-5px"
        mobileLeft="-5px"
      />
    );
  }
}

const SelectAreasWithHOCs = injectLocalize<InputProps>(SelectAreas);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  areas: <GetAreas />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SelectAreasWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
