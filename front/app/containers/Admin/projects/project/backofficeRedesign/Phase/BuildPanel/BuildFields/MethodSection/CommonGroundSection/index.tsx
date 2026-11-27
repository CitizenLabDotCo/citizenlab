import React, { useState } from 'react';

import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';
import Spinner from 'design-system/Spinner';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';
import AddInputModal from '../AddInputModal';
import methodSectionMessages from '../messages';
import useStagedInputs from '../useStagedInputs';

import styles from './CommonGroundSection.module.css';
import ImportInputsModal from './ImportInputsModal';
import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
}

const CommonGroundSection = ({ projectId, phaseId }: Props) => {
  const { formatMessage, formatNumber } = useIntl();
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
        hasButtons={count === 0 && !importProgress}
        action={
          count > 0 || importProgress ? (
            <div className={styles.actions}>
              <IconButton
                icon="plus-16"
                aria-label={addLabel}
                onPress={() => setAddOpened(true)}
              />
              <IconButton
                icon="upload-16"
                aria-label={importLabel}
                isDisabled={!!importProgress}
                onPress={() => setImportOpened(true)}
              />
              <div className={styles.status}>
                {(saving || importProgress) && <Spinner />}
                <SummaryPill
                  label={
                    importProgress
                      ? formatMessage(messages.importingStatements, {
                          done: importProgress.done,
                          total: importProgress.total,
                        })
                      : formatNumber(count)
                  }
                />
              </div>
            </div>
          ) : (
            <div className={styles.emptyActions}>
              <Button variant="secondary" onPress={() => setAddOpened(true)}>
                {addLabel}
              </Button>
              <Button variant="primary" onPress={() => setImportOpened(true)}>
                {importLabel}
              </Button>
            </div>
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
