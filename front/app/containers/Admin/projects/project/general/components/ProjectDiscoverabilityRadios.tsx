import React from 'react';

import { Box, Text, Radio } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  listed: boolean;
  onChange: () => void;
}

const ProjectDiscoverabilityRadios = ({ listed, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="24px">
      <Radio
        name="public"
        value={true}
        currentValue={listed}
        label={
          <Box>
            <Text color="primary" fontWeight="bold" mt="-1px" mb="0">
              {formatMessage(messages.public)}
            </Text>
            <Text color="primary" fontSize="s" mt="4px" mb="0px">
              {formatMessage(messages.thisProjectIsVisibleToEveryone)}
            </Text>
          </Box>
        }
        onChange={onChange}
      />
      <Radio
        name="hidden"
        value={false}
        currentValue={listed}
        label={
          <Box>
            <Text color="primary" fontWeight="bold" mt="-1px" mb="0">
              {formatMessage(messages.hidden)}
            </Text>
            <Text color="primary" fontSize="s" mt="4px" mb="0px">
              {formatMessage(messages.thisProjectWillBeHidden)}
              <ul>
                <li>{formatMessage(messages.notVisible)}</li>
                <li>{formatMessage(messages.notIndexed)}</li>
                <li>{formatMessage(messages.emailNotifications)}</li>
                <li>{formatMessage(messages.onlyAccessible)}</li>
              </ul>
            </Text>
          </Box>
        }
        onChange={onChange}
      />
    </Box>
  );
};

export default ProjectDiscoverabilityRadios;
