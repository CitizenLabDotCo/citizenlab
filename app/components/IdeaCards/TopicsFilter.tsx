import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isError } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

// components
import T from 'components/T';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// styling
import styled from 'styled-components';

// typings
import { ITopicData } from 'services/topics';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 15px;
  margin-left: 18px;
`;

const Topics = styled.div``;

const Topic = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: normal;
  display: inline-block;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-right: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  border: solid 1px ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};

  &:hover,
  &.active {
    color: #fff;
    background: #448943;
    border-color: #448943;
  }
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const TopicsFilter = memo<Props>(({ topics, className }) => {
  if (!isNilOrError(topics) && topics.length > 0) {
    return (
      <Container className={className}>
        <Title>
          <FormattedMessage {...messages.topicsTitle} />
        </Title>

        <Topics>
          {topics.filter(topic => !isError(topic)).map((topic: ITopicData) => (
            <Topic key={topic.id}>
              <T value={topic.attributes.title_multiloc} />
            </Topic>
          ))}
        </Topics>
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  topics: <GetTopics />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicsFilter {...inputProps} {...dataProps} />}
  </Data>
);
