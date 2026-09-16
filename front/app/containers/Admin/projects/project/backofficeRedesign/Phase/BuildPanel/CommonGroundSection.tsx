import React, { useState } from 'react';

import { Box, Button, Divider } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import ImportInputsModal from 'components/admin/PostManager/CommonGroundInputManager/ImportInputsModal';
import commonGroundMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';

interface Props {
  projectId: string;
  phaseId: string;
}

const CommonGroundSection = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [importOpened, setImportOpened] = useState(false);
  const { data: project } = useProjectById(projectId);
  const slug = project?.data.attributes.slug;

  return (
    <>
      <Divider />
      <PanelField label={formatMessage(messages.inputsSection)}>
        <Box display="flex" gap="8px" flexWrap="wrap">
          <ButtonWithLink
            buttonStyle="secondary-outlined"
            width="auto"
            to={slug ? '/projects/$slug/ideas/new' : undefined}
            params={slug ? { slug } : undefined}
            search={{ phase_id: phaseId }}
            disabled={!slug}
          >
            {formatMessage(commonGroundMessages.createInput)}
          </ButtonWithLink>
          <Button
            buttonStyle="admin-dark"
            width="auto"
            onClick={() => setImportOpened(true)}
          >
            {formatMessage(commonGroundMessages.startFromPastInputs)}
          </Button>
        </Box>
      </PanelField>

      <ImportInputsModal
        showPastInputsModal={importOpened}
        setShowPastInputsModal={setImportOpened}
        currentPhaseid={phaseId}
      />
    </>
  );
};

export default CommonGroundSection;
