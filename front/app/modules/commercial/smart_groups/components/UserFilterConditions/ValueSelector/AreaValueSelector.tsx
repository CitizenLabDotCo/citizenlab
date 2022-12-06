import React from 'react';
import { IOption } from 'typings';
import { Select } from '@citizenlab/cl2-component-library';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { isNilOrError } from 'utils/helperUtils';
import localize, { InjectedLocalized } from 'utils/localize';
import { TRule } from '../rules';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  areas: GetAreasChildProps;
};

interface State {}

class AreaValueSelector extends React.PureComponent<
  Props & InjectedLocalized,
  State
> {
  generateOptions = (): IOption[] => {
    const { areas, localize } = this.props;

    if (!isNilOrError(areas)) {
      return areas.map((area) => ({
        value: area.id,
        label: localize(area.attributes.title_multiloc),
      }));
    } else {
      return [];
    }
  };

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  };

  render() {
    const { value } = this.props;

    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const AreaValueSelectorWithHOC = localize(AreaValueSelector);

export default (inputProps: Props) => (
  <GetAreas>
    {(areas) => <AreaValueSelectorWithHOC {...inputProps} areas={areas} />}
  </GetAreas>
);
