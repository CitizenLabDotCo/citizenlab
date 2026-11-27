import React, { useState } from 'react';

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import Text from 'design-system/Text';
import UnstyledButton from 'design-system/UnstyledButton';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'components/admin/FormSync/messages';
import PDFExportModal from 'components/admin/FormSync/PDFExportModal';
import { FormType } from 'components/FormBuilder/utils';
import upsellMessages from 'components/UpsellTooltip/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import managerMessages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

import styles from './SideColumn.module.css';

interface Props {
  formType: FormType;
  pdfImportSupported: boolean;
}

// The library's Import paper form body: scans, then a spreadsheet.
const PaperFormImport = ({ formType, pdfImportSupported }: Props) => {
  const { formatMessage } = useIntl();
  const { terms, term } = useInputTermLabels();
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId?: string;
  };
  const [exportOpened, setExportOpened] = useState(false);
  const printedFormsEnabled = useFeatureFlag({ name: 'import_printed_forms' });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  if (!phaseId) return null;

  const importerPath = `/admin/projects/${projectId}/phases/${phaseId}/input-importer`;

  return (
    <div className={styles.paperImport}>
      {pdfImportSupported && (
        <Text variant="ui" tone="secondary">
          <FormattedMessage
            {...managerMessages.noOfflineForm}
            values={{
              downloadLink: (
              <UnstyledButton
                className={styles.inlineLink}
                onPress={() => setExportOpened(true)}
              >
                {formType === 'survey'
                  ? formatMessage(managerMessages.downloadFromSurvey)
                  : formatMessage(managerMessages.downloadFromForm, { term })}
              </UnstyledButton>
              ),
            }}
          />
        </Text>
      )}
      {pdfImportSupported && (
        <>
          <div className={styles.importSection}>
            <div>
              <Text variant="ui" tone="primary">
                {formatMessage(managerMessages.paperForms)}
              </Text>
              <Text variant="small" tone="secondary">
                {formatMessage(managerMessages.paperFormsDescription, {
                  terms,
                })}
              </Text>
            </div>
            <span>
              <Button
                href={printedFormsEnabled ? importerPath : undefined}
                disabledReason={
                  printedFormsEnabled
                    ? undefined
                    : `${formatMessage(
                        messages.unlockScanningTooltip1
                      )} ${formatMessage(messages.unlockScanningTooltip2)}`
                }
              >
                {formatMessage(messages.importScans)}
              </Button>
            </span>
          </div>
          <Divider />
        </>
      )}
      <div className={styles.importSection}>
        <div>
          <Text variant="ui" tone="primary">
            {formatMessage(messages.spreadsheet)}
          </Text>
          <Text variant="small" tone="secondary">
            {formatMessage(managerMessages.spreadsheetDescription, { terms })}
          </Text>
        </div>
        <span>
          <Button
            href={inputImporterAllowed ? importerPath : undefined}
            disabledReason={
              inputImporterAllowed
                ? undefined
                : formatMessage(upsellMessages.tooltipContent)
            }
          >
            {formatMessage(messages.importFile)}
          </Button>
        </span>
      </div>
      {pdfImportSupported && (
        <PDFExportModal
          open={exportOpened}
          formType={formType}
          onClose={() => setExportOpened(false)}
          phaseId={phaseId}
        />
      )}
    </div>
  );
};

export default PaperFormImport;
