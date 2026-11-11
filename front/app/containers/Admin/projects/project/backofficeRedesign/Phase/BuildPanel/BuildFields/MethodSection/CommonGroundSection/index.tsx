import React, { useState } from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';
import AddInputModal from '../AddInputModal';
import methodSectionMessages from '../messages';
import useStagedInputs from '../useStagedInputs';

import ImportInputsModal from './ImportInputsModal';
import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
}

const CommonGroundSection = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [addOpened, setAddOpened] = useState(false);
  const [importOpened, setImportOpened] = useState(false);
  const { count, saving, importProgress, add, addImport } = useStagedInputs(
    projectId,
    phaseId
  );

  const addLabel = formatMessage(methodSectionMessages.addStatement);
  const importLabel = formatMessage(messages.importStatements);

  return (
    <>
      <PanelField
        label={formatMessage(messages.statementsSection)}
        action={
          count > 0 || importProgress ? (
            <Box display="flex" alignItems="center" gap="4px">
              <IconAction
                icon="plus"
                tooltip={addLabel}
                ariaLabel={addLabel}
                onClick={() => setAddOpened(true)}
              />
              <IconAction
                icon="upload-file"
                tooltip={importLabel}
                ariaLabel={importLabel}
                disabled={!!importProgress}
                onClick={() => setImportOpened(true)}
              />
              <Box display="flex" alignItems="center" gap="6px">
                {(saving || importProgress) && <Spinner size="14px" />}
                <SummaryPill
                  label={
                    importProgress
                      ? formatMessage(messages.importingStatements, {
                          done: importProgress.done,
                          total: importProgress.total,
                        })
                      : formatMessage(messages.nStatements, { count })
                  }
                />
              </Box>
            </Box>
          ) : (
            <Box
              display="flex"
              gap="8px"
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              <Button
                buttonStyle="bo-secondary"
                boSize="medium"
                width="auto"
                onClick={() => setAddOpened(true)}
              >
                {addLabel}
              </Button>
              <Button
                buttonStyle="bo-primary"
                boSize="medium"
                width="auto"
                onClick={() => setImportOpened(true)}
              >
                {importLabel}
              </Button>
            </Box>
          )
        }
      />

      {addOpened && (
        <AddInputModal
          phaseId={phaseId}
          kind="statement"
          onSubmit={add}
          onClose={() => setAddOpened(false)}
        />
      )}

      {importOpened && (
        <ImportInputsModal
          projectId={projectId}
          phaseId={phaseId}
          onImport={addImport}
          onClose={() => setImportOpened(false)}
        />
      )}
    </>
  );
};

export default CommonGroundSection;
