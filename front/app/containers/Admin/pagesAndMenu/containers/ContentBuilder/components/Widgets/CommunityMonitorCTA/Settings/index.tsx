import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const Settings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    title,
    description,
    surveyButtonText,
  } = useNode((node) => ({
    title: node.data.props.title,
    description: node.data.props.description,
    surveyButtonText: node.data.props.surveyButtonText,
  }));

  return (
    <Box
      background={colors.white}
      my="20px"
      display="flex"
      flexDirection="column"
      gap="16px"
    >
      <Text m="0px" fontWeight="bold">
        {formatMessage(messages.important)}
      </Text>
      <Text m="0px">
        {formatMessage(messages.communityMonitorCTADescription)}
      </Text>
      <InputMultilocWithLocaleSwitcher
        id="community_monitor_title"
        type="text"
        label={formatMessage(messages.communityMonitorTitle)}
        name="community_monitor_title"
        valueMultiloc={title}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.title = valueMultiloc))
        }
      />
      <InputMultilocWithLocaleSwitcher
        id="community_monitor_description"
        type="text"
        label={formatMessage(messages.communityMonitorDescription)}
        name="community_monitor_description"
        valueMultiloc={description}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.description = valueMultiloc))
        }
      />
      <InputMultilocWithLocaleSwitcher
        id="community_monitor_submit_btn_text"
        type="text"
        label={formatMessage(messages.communityMonitorSubmitBtnText)}
        name="community_monitor_submit_btn_text"
        valueMultiloc={surveyButtonText}
        onChange={(valueMultiloc) =>
          setProp((props) => (props.surveyButtonText = valueMultiloc))
        }
      />
    </Box>
  );
};

export default Settings;
