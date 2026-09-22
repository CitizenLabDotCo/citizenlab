import React, { useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useDeletePhase from 'api/phases/useDeletePhase';

import useLocalize from 'hooks/useLocalize';

import phaseMessages from 'containers/Admin/projects/project/phase/messages';

import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import TypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal';
import typedDeleteConfirmationMessages from 'components/UI/TypedDeleteConfirmationModal/messages';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhaseOptionsMenu = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: deletePhase } = useDeletePhase();
  const title = localize(phase.attributes.title_multiloc);

  const handleDelete = () => {
    deletePhase(
      { phaseId: phase.id, projectId },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          // The open phase no longer exists, so fall back to the project.
          if (phaseId === phase.id) {
            clHistory.push(`/admin/projects/${projectId}`);
          }
        },
      }
    );
  };

  return (
    <>
      <MoreActionsMenu
        showLabel={false}
        color={colors.coolGrey500}
        ideaTitle={title}
        menuRight="-12px"
        actions={[
          {
            label: formatMessage(phaseMessages.deletePhase),
            handler: () => setShowDeleteModal(true),
          },
        ]}
      />
      <TypedDeleteConfirmationModal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title={phaseMessages.deletePhaseModalTitle}
        entityName={title}
        mainWarning={phaseMessages.deletePhaseModalWarning}
        confirmationWord={
          typedDeleteConfirmationMessages.confirmationWordDelete
        }
        deleteButtonText={phaseMessages.deletePhaseButtonText}
      />
    </>
  );
};

export default PhaseOptionsMenu;
