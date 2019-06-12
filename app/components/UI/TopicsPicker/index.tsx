import React from 'react';
import { adopt } from 'react-adopt';
import { orderBy } from 'lodash-es';

// Components
import Button from 'components/UI/Button';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';

// intl
import T from 'components/T';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

const TopicsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TopicSwitch = styled(Button)`
  margin-bottom: 4px;
  margin-right: 4px;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: ${({ style }: any)  => style === 'text' ? `1px solid ${colors.separation}` : 'none'};
`;

export interface InputProps {
  onChange: (tocisIds: string[]) => void;
  value: string[];
  max: number;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const TopicsPicker = ({ onChange, value, localize, topics, max }: Props & InjectedLocalized) => {
  const handleOnChange = (topicId: string) => (event) => {
    const newTopics = [...value];
    if (!value) {
      onChange([topicId]);
    } else {
      const i = newTopics.lastIndexOf(topicId);
      if (i === -1) {
        if (value.length === max) {
          console.log(event, event.currentTarget);
          // TODO animate?
        } else {
          newTopics.push(topicId);
          onChange(newTopics);
        }
      } else {
        newTopics.splice(i, 1);
        onChange(newTopics);
      }
    }
  };

  if (isNilOrError(topics)) return null;

  const workingTopics = topics.filter(topic => !isNilOrError(topic)) as ITopicData[];

  return (
    <TopicsContainer>
      {orderBy(workingTopics, topic => localize(topic.attributes.title_multiloc)).map((topic) => {
        const isActive = value && !!value.find(id => id === topic.id);
        return (
          <TopicSwitch
            key={topic.id}
            onClick={handleOnChange(topic.id)}
            style={isActive ? 'primary' : 'text'}
            bgColor={isActive ? colors.clGreen : undefined}
            padding="7px 14px"
          >
            <T value={topic.attributes.title_multiloc} />
          </TopicSwitch>
        );
      })}
    </TopicsContainer>
  );
};

const Data = adopt<DataProps,  InputProps>({
   topics: <GetTopics />
 });

 const TopicsPickerWithHoc = injectLocalize(TopicsPicker);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicsPickerWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
