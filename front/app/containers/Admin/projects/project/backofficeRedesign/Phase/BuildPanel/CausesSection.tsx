import React, { useState } from 'react';

import {
  Box,
  Divider,
  NewBOButton,
  NewBOText,
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
        <NewBOText variant="helper" mb="12px">
          {formatMessage(messages.causesSectionDescription)}
        </NewBOText>
        {causes && causes.data.length > 0 && (
          <Box as="ul" pl="20px" mt="0" mb="12px">
            {causes.data.map((cause) => (
              <li key={cause.id}>
                <NewBOText variant="label" my="2px">
                  <T value={cause.attributes.title_multiloc} />
                </NewBOText>
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
          <NewBOText variant="helper" mb="16px">
            {formatMessage(volunteeringMessages.newCauseSubtitle)}
          </NewBOText>
          <CauseForm onSubmit={handleSubmit} submitPlacement="inline" />
        </Box>
      </Modal>
    </>
  );
};

export default CausesSection;
