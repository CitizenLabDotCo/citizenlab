import MultipleSelect from 'components/UI/MultipleSelect';
import React from 'react';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';
import { IOption } from 'typings';
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
