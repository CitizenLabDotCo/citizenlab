import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { orderBy } from 'lodash-es';

// Components
import Button from 'components/UI/Button';

// styles
import styled, { withTheme } from 'styled-components';
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
  margin-bottom: 5px;
  margin-right: 5px;
`;

export interface InputProps {
  onChange: (tocisIds: string[]) => void;
  onBlur?: () => void;
  value: string[];
  max: number;
  id?: string;
  className?: string;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const TopicsPicker = memo(({ onChange, onBlur, value, localize, topics, max, theme, className }: Props & InjectedLocalized) => {
  const handleOnChange = (topicId: string) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    const newTopics = [...value];
    if (!value) {
      onChange([topicId]);
    } else {
      const i = newTopics.lastIndexOf(topicId);
      if (i === -1) {
        if (value.length <= max) {
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
    <TopicsContainer onBlur={onBlur} className={className}>
      {orderBy(workingTopics, topic => localize(topic.attributes.title_multiloc)).map((topic) => {
        const isActive = value && !!value.find(id => id === topic.id);
        const isDisabled = !isActive && value.length >= max;
        return (
          <TopicSwitch
            key={topic.id}
            onClick={handleOnChange(topic.id)}
            textColor={isActive ? 'white' : colors.adminSecondaryTextColor}
            bgColor={isActive ? theme.colorSecondary : 'transparent'}
            borderColor={isActive ? 'none' : colors.separation}
            borderHoverColor={!isDisabled ? theme.colorSecondary : 'transparent'}
            padding="8px 14px"
            disabled={isDisabled}
          >
            <T value={topic.attributes.title_multiloc} />
          </TopicSwitch>
        );
      })}
    </TopicsContainer>
  );
});

const Data = adopt<DataProps,  InputProps>({
  topics: <GetTopics />
});

const TopicsPickerWithHoc = withTheme(injectLocalize(TopicsPicker));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicsPickerWithHoc {...inputProps} {...dataProps} />}
  </Data>
);
