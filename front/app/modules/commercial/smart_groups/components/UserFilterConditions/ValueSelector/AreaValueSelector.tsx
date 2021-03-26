import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  areas: GetAreasChildProps;
};

type State = {};

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
