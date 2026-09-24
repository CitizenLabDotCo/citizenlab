import React, { useState } from 'react';

import {
  Box,
  Divider,
  NewBOButton,
  Text,
} from '@citizenlab/cl2-component-library';

import useAddCause from 'api/causes/useAddCause';
import useCauses from 'api/causes/useCauses';

import CauseForm, {
  SubmitValues,
} from 'containers/Admin/projects/project/volunteering/CauseForm';
import volunteeringMessages from 'containers/Admin/projects/project/volunteering/messages';

import T from 'components/T';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';

interface Props {
  phaseId: string;
}

const CausesSection = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const { data: causes } = useCauses({ phaseId });
  const { mutateAsync: addCause } = useAddCause();

  const handleSubmit = async ({
    title_multiloc,
    description_multiloc,
    image,
  }: SubmitValues) => {
    await addCause({
      phase_id: phaseId,
      title_multiloc,
      description_multiloc,
      image,
    });
    setOpened(false);
  };

  return (
    <>
      <Divider />
      <PanelField label={formatMessage(messages.causesSection)}>
        <Text fontSize="s" color="textSecondary" mt="0" mb="12px">
          {formatMessage(messages.causesSectionDescription)}
        </Text>
        {causes && causes.data.length > 0 && (
          <Box as="ul" pl="20px" mt="0" mb="12px">
            {causes.data.map((cause) => (
              <li key={cause.id}>
                <Text fontSize="s" my="2px">
                  <T value={cause.attributes.title_multiloc} />
                </Text>
              </li>
            ))}
          </Box>
        )}
        <NewBOButton
          buttonStyle="secondary-outlined"
          onClick={() => setOpened(true)}
        >
          {formatMessage(volunteeringMessages.addCauseButton)}
        </NewBOButton>
      </PanelField>

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width={720}
        header={formatMessage(volunteeringMessages.newCauseTitle)}
      >
        <Box p="24px">
          <Text mt="0" color="textSecondary">
            {formatMessage(volunteeringMessages.newCauseSubtitle)}
          </Text>
          <CauseForm onSubmit={handleSubmit} submitPlacement="inline" />
        </Box>
      </Modal>
    </>
  );
};

export default CausesSection;
