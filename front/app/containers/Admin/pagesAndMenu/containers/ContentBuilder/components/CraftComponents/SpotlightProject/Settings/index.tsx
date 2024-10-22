import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import ProjectSelect from './ProjectSelect';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    buttonTextMultiloc,
    projectId,
  } = useNode((node) => ({
    buttonTextMultiloc: node.data.props.buttonTextMultiloc,
    projectId: node.data.props.projectId,
  }));

  return (
    <Box mt="48px" mb="20px">
      <Box mb="20px">
        <ProjectSelect projectId={projectId} />
      </Box>
      <Box>
        <InputMultilocWithLocaleSwitcher
          id="spotlight-button-text-multiloc"
          type="text"
          label={formatMessage(messages.buttonText)}
          name="spotlight-button-text-multiloc"
          valueMultiloc={buttonTextMultiloc}
          onChange={(valueMultiloc) =>
            setProp((props) => (props.buttonTextMultiloc = valueMultiloc))
          }
        />
      </Box>
    </Box>
  );
};

export default Settings;
