import React from 'react';
import { IOption } from 'typings';
import GetIdeaStatuses, {
  GetIdeaStatusesChildProps,
} from 'resources/GetIdeaStatuses';
import MultipleSelect from 'components/UI/MultipleSelect';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  value: string;
  onChange: (string) => void;
  ideaStatuses: GetIdeaStatusesChildProps;
};

type State = {};

class IdeaStatusValuesSelector extends React.PureComponent<
  Props & InjectedLocalized,
  State
> {
  generateOptions = (): IOption[] => {
    const { ideaStatuses, localize } = this.props;

    if (!isNilOrError(ideaStatuses)) {
      return ideaStatuses.map((ideaStatus) => {
        return {
          value: ideaStatus.id,
          label: localize(ideaStatus.attributes.title_multiloc),
        };
      });
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

const IdeaStatusValuesSelectorWithHOC = localize(IdeaStatusValuesSelector);

export default (inputProps) => (
  <GetIdeaStatuses>
    {(ideaStatuses) => (
      <IdeaStatusValuesSelectorWithHOC
        {...inputProps}
        ideaStatuses={ideaStatuses}
      />
    )}
  </GetIdeaStatuses>
);
