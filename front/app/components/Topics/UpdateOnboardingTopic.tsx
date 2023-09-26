import React from 'react';
import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import T from 'components/T';
import useUpdateTopic from 'api/topics/useUpdateTopic';
import { ITopicData } from 'api/topics/types';
import Error from 'components/UI/Error';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  topic: ITopicData;
}

const UpdateOnboardingTopic = ({ topic }: Props) => {
  const { mutate: updateTopic, isLoading, error } = useUpdateTopic();
  const { formatMessage } = useIntl();
  const color = topic.attributes.include_in_onboarding
    ? colors.success
    : colors.coolGrey300;
  const iconName = topic.attributes.include_in_onboarding
    ? 'check-circle'
    : 'plus-circle';

  const onClick = () => {
    updateTopic({
      id: topic.id,
      include_in_onboarding: !topic.attributes.include_in_onboarding,
    });
  };

  return (
    <>
      <Badge color={color} onClick={onClick}>
        <Button
          buttonStyle="text"
          icon={iconName}
          iconColor={color}
          iconPos="right"
          padding="0px"
          my="0px"
          processing={isLoading}
        >
          <T value={topic.attributes.title_multiloc} />
        </Button>
      </Badge>
      {error && <Error text={formatMessage(messages.topicUpdateError)} />}
    </>
  );
};

export default UpdateOnboardingTopic;
