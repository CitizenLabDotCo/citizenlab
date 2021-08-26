import React from 'react';
import { IOption } from 'typings';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import MultipleSelect from 'components/UI/MultipleSelect';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

type Props = {
  value: string;
  onChange: (string) => void;
  topics: GetTopicsChildProps;
};

type State = {};

class TopicValuesSelector extends React.PureComponent<
  Props & InjectedLocalized,
  State
> {
  generateOptions = (): IOption[] => {
    const { topics, localize } = this.props;

    if (!isNilOrError(topics)) {
      return topics
        .filter((topic) => !isNilOrError(topic))
        .map((topic: ITopicData) => {
          return {
            value: topic.id,
            label: localize(topic.attributes.title_multiloc),
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

const TopicValuesSelectorWithHOC = localize(TopicValuesSelector);

export default (inputProps) => (
  <GetTopics>
    {(topics) => <TopicValuesSelectorWithHOC {...inputProps} topics={topics} />}
  </GetTopics>
);
