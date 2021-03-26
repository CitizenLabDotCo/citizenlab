import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import MultipleSelect from 'components/UI/MultipleSelect';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  areas: GetAreasChildProps;
};

type State = {};

class AreaValuesSelector extends React.PureComponent<
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

  handleOnChange = (options: IOption[]) => {
    const optionIds = options.map((o) => o.value);
    this.props.onChange(optionIds);
  };

  render() {
    const { value } = this.props;

    return (
      <MultipleSelect
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
      />
    );
  }
}

const AreaValuesSelectorWithHOC = localize(AreaValuesSelector);

export default (inputProps) => (
  <GetAreas>
    {(areas) => <AreaValuesSelectorWithHOC {...inputProps} areas={areas} />}
  </GetAreas>
);
