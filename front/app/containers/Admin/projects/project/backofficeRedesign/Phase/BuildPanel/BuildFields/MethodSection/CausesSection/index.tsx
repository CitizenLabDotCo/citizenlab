import React, { useState } from 'react';

import { exportVolunteers } from 'api/causes/util';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';

import CauseModal from './CauseModal';
import styles from './CausesSection.module.css';
import CauseRow from './CauseRow';
import DeleteCauseModal from './DeleteCauseModal';
import messages from './messages';
import useStagedCauses, {
  StagedCause,
  causeImageUrl,
  causeTitle,
} from './useStagedCauses';

type ModalState = { cause?: StagedCause } | null;

interface Props {
  phaseId: string;
}

const CausesSection = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [toDelete, setToDelete] = useState<StagedCause | null>(null);
  const [exporting, setExporting] = useState(false);
  const causes = useStagedCauses(phaseId);

  const causeList = causes.list;
  const hasSignUps = causeList.some(
    ({ saved }) => !!saved && saved.attributes.volunteers_count > 0
  );
  const label = formatMessage(messages.causesSection);
  const addLabel = formatMessage(messages.addACause);
  const downloadLabel = formatMessage(messages.downloadVolunteers);

  const download = async () => {
    setExporting(true);
    try {
      await exportVolunteers(phaseId);
    } finally {
      setExporting(false);
    }
  };

  const openAdd = () => setModal({});

  return (
    <>
      {causeList.length > 0 ? (
        <PanelField
          label={label}
          action={
            <div className={styles.actions}>
              <IconButton
                icon="list-14"
                aria-label={formatMessage(
                  open ? messages.hideCauses : messages.showCauses
                )}
                aria-expanded={open}
                onPress={() => setOpen((open) => !open)}
              />
              <IconButton
                icon="plus-16"
                aria-label={addLabel}
                onPress={openAdd}
              />
              <IconButton
                icon="download-16"
                aria-label={downloadLabel}
                isDisabled={exporting}
                disabledReason={
                  hasSignUps
                    ? undefined
                    : formatMessage(messages.nobodySignedUpYet)
                }
                onPress={download}
              />
              {!open && (
                <SummaryPill
                  label={formatMessage(messages.nCauses, {
                    count: causeList.length,
                  })}
                />
              )}
            </div>
          }
        >
          {open && (
            <ul className={styles.list}>
              {causeList.map((cause) => (
                <CauseRow
                  key={cause.key}
                  title={causeTitle(cause)}
                  imageUrl={causeImageUrl(cause)}
                  volunteersCount={
                    cause.saved?.attributes.volunteers_count ?? 0
                  }
                  onEdit={() => setModal({ cause })}
                  onDelete={() => setToDelete(cause)}
                />
              ))}
            </ul>
          )}
        </PanelField>
      ) : (
        <PanelField label={label}>
          <div className={styles.emptyActions}>
            <Button
              variant="secondary"
              size={28}
              disabledReason={formatMessage(messages.nobodySignedUpYet)}
            >
              {downloadLabel}
            </Button>
            <Button variant="primary" size={28} onPress={openAdd}>
              {addLabel}
            </Button>
          </div>
        </PanelField>
      )}

      {modal && (
        <CauseModal
          // Each cause starts the form from its own values.
          key={modal.cause?.key ?? 'new'}
          cause={modal.cause}
          onSubmit={(values) => {
            const { cause } = modal;
            if (cause) {
              causes.update(cause.key, values);
            } else {
              causes.add(values);
            }
          }}
          onClose={() => setModal(null)}
        />
      )}

      {toDelete && (
        <DeleteCauseModal
          onConfirm={() => causes.remove(toDelete)}
          onClose={() => setToDelete(null)}
        />
      )}
    </>
  );
};

export default CausesSection;
