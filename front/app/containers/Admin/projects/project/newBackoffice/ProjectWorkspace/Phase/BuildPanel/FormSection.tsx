import React, { useState } from 'react';

import { Box, Button, Divider, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import inputFormMessages from '../../../../inputForm/messages';
import { isPDFUploadSupported } from '../../../../inputImporter/ReviewSection/utils';
import messages from '../../messages';

import PanelField from './PanelField';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const FormSection = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const [importModalOpened, setImportModalOpened] = useState(false);

  const participationMethod = phase.attributes.participation_method;

  // Only methods that collect submissions through the simple form editor have
  // an input form to configure here. A native survey builds its form elsewhere.
  if (getMethodConfig(participationMethod).formEditor !== 'simpleFormEditor') {
    return null;
  }

  return (
    <>
      <Divider />

      <PanelField label={formatMessage(inputFormMessages.inputForm)}>
        <Text fontSize="s" color="textSecondary" mt="0" mb="12px">
          {formatMessage(inputFormMessages.inputFormDescription)}
        </Text>
        <Box display="flex">
          <ButtonWithLink
            to="/admin/projects/$projectId/phases/$phaseId/form/edit"
            params={{ projectId, phaseId: phase.id }}
            buttonStyle="admin-dark"
            icon="edit"
            size="s"
          >
            {formatMessage(inputFormMessages.editInputForm)}
          </ButtonWithLink>
        </Box>
      </PanelField>

      <Button
        buttonStyle="text"
        justify="space-between"
        icon="chevron-right"
        iconPos="right"
        iconSize="16px"
        px="0"
        onClick={() => setImportModalOpened(true)}
      >
        {formatMessage(messages.offlineCollection)}
      </Button>

      <Modal
        opened={importModalOpened}
        close={() => setImportModalOpened(false)}
        header={formatMessage(messages.offlineCollection)}
      >
        <Box p="24px">
          <ImportInputsSection
            formType="input_form"
            pdfImportSupported={isPDFUploadSupported(participationMethod)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default FormSection;
