import React from 'react';
import { IOption } from 'typings';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { Select } from 'cl2-component-library';
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

type Props = {
  value: string;
  onChange: (string) => void;
  topics: GetTopicsChildProps;
};

type State = {};

class TopicValueSelector extends React.PureComponent<
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

const TopicValueSelectorWithHOC = localize(TopicValueSelector);

export default (inputProps) => (
  <GetTopics>
    {(topics) => <TopicValueSelectorWithHOC {...inputProps} topics={topics} />}
  </GetTopics>
);
