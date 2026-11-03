import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

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
      <PanelField
        label={formatMessage(messages.causesSection)}
        action={
          <Button
            buttonStyle="bo-text"
            icon="plus"
            iconSize="16px"
            width="32px"
            height="32px"
            padding="0"
            ariaLabel={formatMessage(volunteeringMessages.addCauseButton)}
            onClick={() => setOpened(true)}
          />
        }
      >
        <Text variant="boHelper" m="0">
          {formatMessage(messages.causesSectionDescription)}
        </Text>
        {causes && causes.data.length > 0 && (
          <Box as="ul" pl="20px" m="0">
            {causes.data.map((cause) => (
              <li key={cause.id}>
                <Text variant="boLabel" my="2px">
                  <T value={cause.attributes.title_multiloc} />
                </Text>
              </li>
            ))}
          </Box>
        )}
      </PanelField>

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width={720}
        header={formatMessage(volunteeringMessages.newCauseTitle)}
      >
        <Box p="24px">
          <Text variant="boHelper" mb="16px">
            {formatMessage(volunteeringMessages.newCauseSubtitle)}
          </Text>
          <CauseForm onSubmit={handleSubmit} submitPlacement="inline" />
        </Box>
      </Modal>
    </>
  );
};

export default CausesSection;
