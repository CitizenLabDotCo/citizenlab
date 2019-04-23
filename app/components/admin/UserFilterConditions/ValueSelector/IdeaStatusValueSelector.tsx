import React from 'react';
import { TRule } from '../rules';
import { IOption } from 'typings';
import GetIdeaStatuses, { GetIdeaStatusesChildProps } from 'resources/GetIdeaStatuses';
import Select from 'components/UI/Select';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  rule: TRule;
  value: string;
  onChange: (string) => void;
  ideaStatuses: GetIdeaStatusesChildProps;
  tFunc: any;
};

type State = {};

class IdeaStatusValueSelector extends React.PureComponent<Props & InjectedLocalized, State> {

  generateOptions = (): IOption[] => {
    const { ideaStatuses, localize } = this.props;

    if (!isNilOrError(ideaStatuses)) {
      return ideaStatuses.map((ideaStatus) => {
        return ({
          value: ideaStatus.id,
          label: localize(ideaStatus.attributes.title_multiloc),
        });
      });
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

const IdeaStatusValueSelectorWithHOC = localize(IdeaStatusValueSelector);

export default (inputProps) => (
  <GetIdeaStatuses>
    {ideaStatuses => <IdeaStatusValueSelectorWithHOC {...inputProps} ideaStatuses={ideaStatuses} />}
  </GetIdeaStatuses>
);
