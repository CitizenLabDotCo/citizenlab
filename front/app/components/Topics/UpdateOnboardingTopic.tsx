import React from 'react';

import { Badge, colors, Button } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IGlobalTopicData } from 'api/global_topics/types';
import useUpdateGlobalTopic from 'api/global_topics/useUpdateGlobalTopic';

import T from 'components/T';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  topic: IGlobalTopicData;
}

const UpdateOnboardingTopic = ({ topic }: Props) => {
  const { mutate: updateTopic, isLoading, error } = useUpdateGlobalTopic();
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const iconName = topic.attributes.include_in_onboarding
    ? 'check-circle'
    : 'plus-circle';
  const topicButtonContentColor = topic.attributes.include_in_onboarding
    ? colors.white
    : theme.colors.tenantPrimary;
  const className = topic.attributes.include_in_onboarding ? 'inverse' : '';

  const onClick = () => {
    updateTopic({
      id: topic.id,
      include_in_onboarding: !topic.attributes.include_in_onboarding,
    });
  };

  return (
    <>
      <Badge
        color={theme.colors.tenantPrimary}
        className={className}
        onClick={onClick}
      >
        <Button
          buttonStyle="text"
          icon={iconName}
          iconPos="right"
          padding="0px"
          my="0px"
          processing={isLoading}
          textColor={topicButtonContentColor}
          iconColor={topicButtonContentColor}
        >
          <T value={topic.attributes.title_multiloc} />
        </Button>
      </Badge>
      {error && <Error text={formatMessage(messages.topicUpdateError)} />}
    </>
  );
};

export default UpdateOnboardingTopic;
