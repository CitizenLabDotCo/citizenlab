import * as React from 'react';

import { TRule } from '../rules';
import { IOption } from 'typings';

import Select from 'components/UI/Select';

import { injectTFunc } from 'components/T/utils';
import GetAreas, { GetAreasChildProps } from 'resources/GetAreas';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  areas: GetAreasChildProps;
  tFunc: any;
};

type State = {};

class AreaValueSelector extends React.PureComponent<Props, State> {

  generateOptions = (): IOption[] => {
    if (this.props.areas) {
      return this.props.areas.map((area) => (
        {
          value: area.id,
          label: this.props.tFunc(area.attributes.title_multiloc),
        }
      ));
    } else {
      return [];
    }
  }

  handleOnChange = (option: IOption) => {
    this.props.onChange(option.value);
  }

  render() {
    const { value } = this.props;
    return (
      <Select
        value={value}
        options={this.generateOptions()}
        onChange={this.handleOnChange}
        clearable={false}
      />
    );
  }
}

const AreaValueSelectorWithHOC = injectTFunc(AreaValueSelector);

export default (inputProps) => (
  <GetAreas>
    {(areas) => <AreaValueSelectorWithHOC {...inputProps} areas={areas} />}
  </GetAreas>
);
