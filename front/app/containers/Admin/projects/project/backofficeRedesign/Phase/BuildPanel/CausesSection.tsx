import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { exportVolunteers } from 'api/causes/util';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import CauseModal from './CauseModal';
import CauseRow from './CauseRow';
import DeleteCauseModal from './DeleteCauseModal';
import PanelField from './PanelField';
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
            <Box display="flex" alignItems="center" gap="4px">
              <IconAction
                icon="list"
                tooltip={formatMessage(
                  open ? messages.hideCauses : messages.showCauses
                )}
                ariaLabel={formatMessage(
                  open ? messages.hideCauses : messages.showCauses
                )}
                ariaExpanded={open}
                onClick={() => setOpen((open) => !open)}
              />
              <IconAction
                icon="plus"
                tooltip={addLabel}
                ariaLabel={addLabel}
                onClick={openAdd}
              />
              <IconAction
                icon="download"
                tooltip={
                  hasSignUps
                    ? downloadLabel
                    : formatMessage(messages.nobodySignedUpYet)
                }
                ariaLabel={downloadLabel}
                disabled={!hasSignUps || exporting}
                onClick={download}
              />
              {!open && (
                <SummaryPill
                  label={formatMessage(messages.nCauses, {
                    count: causeList.length,
                  })}
                />
              )}
            </Box>
          }
        >
          {open && (
            <Box as="ul" m="0" p="0" style={{ listStyle: 'none' }}>
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
            </Box>
          )}
        </PanelField>
      ) : (
        <PanelField label={label}>
          <Box display="flex" justifyContent="flex-end" gap="8px">
            <Button
              buttonStyle="bo-secondary"
              boSize="medium"
              width="auto"
              disabled
            >
              {downloadLabel}
            </Button>
            <Button
              buttonStyle="bo-primary"
              boSize="medium"
              width="auto"
              onClick={openAdd}
            >
              {addLabel}
            </Button>
          </Box>
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
