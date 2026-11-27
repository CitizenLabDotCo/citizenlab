import React, { useState } from 'react';

import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';

import CauseModal from './CauseModal';
import CauseRow from './CauseRow';
import styles from './CausesSection.module.css';
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
  const causes = useStagedCauses(phaseId);

  const causeList = causes.list;
  const label = formatMessage(messages.causesSection);
  const addLabel = formatMessage(messages.addACause);

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
        <PanelField
          label={label}
          hasButtons
          action={
            <Button variant="primary" icon="plus-16" onPress={openAdd}>
              {addLabel}
            </Button>
          }
        />
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
