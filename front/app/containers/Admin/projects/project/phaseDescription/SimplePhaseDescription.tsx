import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../phaseSetup/messages';

interface Props {
  phaseId: string;
  descriptionMultiloc: Multiloc;
}

const SimplePhaseDescription = ({ phaseId, descriptionMultiloc }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updatePhase, isLoading } = useUpdatePhase();
  const [localDescription, setLocalDescription] =
    useState<Multiloc>(descriptionMultiloc);

  const handleSave = () => {
    updatePhase({
      phaseId,
      description_multiloc: localDescription,
    });
  };

  return (
    <Box>
      <Text fontWeight="bold" m="0px" mb="12px">
        {formatMessage(messages.draftDescriptionPublishedTitle)}
      </Text>
      <QuillMultilocWithLocaleSwitcher
        id="description"
        valueMultiloc={localDescription}
        onChange={setLocalDescription}
        withCTAButton
      />
      <Box display="flex" justifyContent="flex-end" mt="8px">
        <Button
          buttonStyle="admin-dark"
          onClick={handleSave}
          processing={isLoading}
        >
          {formatMessage(messages.draftDescriptionPublish)}
        </Button>
      </Box>
    </Box>
  );
};

export default SimplePhaseDescription;
