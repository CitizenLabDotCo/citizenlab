import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IBackgroundJobData } from 'api/background_jobs/types';
import useTrackBackgroundJobs from 'api/background_jobs/useTrackBackgroundJobs';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useApproveImportedIdeas from 'api/import_ideas/useApproveImportedIdeas';
import useDeleteAllDraftImportedIdeas from 'api/import_ideas/useDeleteAllDraftImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import WarningModal from 'components/WarningModal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import EmptyState from './EmptyState';
import IdeaEditor from './IdeaEditor';
import IdeaList from './IdeaList';
import messages from './messages';
import PDFViewer from './PDFViewer';
import RecentlyApprovedList, { ApprovedIdea } from './RecentlyApprovedList';

const ReviewSection = ({
  importJobs,
}: {
  importJobs: IBackgroundJobData[];
}) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState({ approved: 0, not_approved: 0 });
  const [confirmAction, setConfirmAction] = useState<
    'approveAll' | 'removeAll' | null
  >(null);
  const [approvedThisSession, setApprovedThisSession] = useState<
    ApprovedIdea[]
  >([]);
  const [undoingId, setUndoingId] = useState<string | null>(null);

  const {
    data: ideas,
    refetch: refetchIdeas,
    isLoading: isLoadingIdeas,
  } = useImportedIdeas({ projectId, phaseId });

  const {
    active: importing,
    failed: importFailed,
    errors: importErrors,
  } = useTrackBackgroundJobs({
    jobs: importJobs,
    onChange: refetchIdeas,
  });

  const { mutate: deleteIdea } = useDeleteIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { mutate: approveIdeas, isLoading: isApproving } =
    useApproveImportedIdeas();
  const { mutate: deleteAllIdeas, isLoading: isDeleting } =
    useDeleteAllDraftImportedIdeas();

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: isLoadingIdeas
      ? undefined
      : idea?.data.relationships.idea_import?.data?.id,
  });

  if (ideas === undefined) return null;

  const numIdeas = ideas.data.length;
  if (importJobs.length === 0 && numIdeas === 0) {
    return <EmptyState />;
  }

  const handleSelectIdea = (ideaId: string) => {
    setIdeaId(ideaId);
  };

  const handleDeleteIdea = (idToBeDeleted: string) => {
    deleteIdea(idToBeDeleted, {
      onSuccess: () => {
        if (ideaId === idToBeDeleted) {
          setIdeaId(null);
        }
      },
    });
  };

  const importType = ideaMetadata?.data.attributes.import_type;

  const handleApproveAll = () => {
    approveIdeas(phaseId, {
      onSuccess: (data) => {
        setApprovals(data.data.attributes);
        setIdeaId(null);
        setConfirmAction(null);
        refetchIdeas();
      },
    });
  };

  const handleDeleteAll = () => {
    deleteAllIdeas(phaseId, {
      onSuccess: () => {
        setIdeaId(null);
        setConfirmAction(null);
        refetchIdeas();
      },
    });
  };

  const handleIdeaApproved = (approved: ApprovedIdea) => {
    setApprovedThisSession((prev) => [approved, ...prev]);
  };

  const handleUndoApproval = async (id: string) => {
    setUndoingId(id);
    try {
      await updateIdea({
        id,
        requestBody: { publication_status: 'draft' },
      });
      setApprovedThisSession((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setUndoingId(null);
    }
  };

  return (
    <Box
      mt="40px"
      w="100%"
      bgColor={colors.white}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box
        px="40px"
        display="flex"
        justifyContent="space-between"
        pt="10px"
        borderTop={`10px ${colors.grey100} solid`}
        borderBottom={`5px ${colors.grey200} solid`}
      >
        <Title variant="h2" color="primary" mt="8px" mb="20px">
          <FormattedMessage {...messages.importedInputs} />
        </Title>
      </Box>

      <Box px="25px" borderBottom={`5px ${colors.grey200} solid`}>
        <Box display="flex">
          <Box w="100%" display="flex" alignItems="center">
            <Box pl="15px" py="10px">
              <ButtonWithLink
                bgColor={colors.primary}
                icon="check"
                processing={isApproving}
                disabled={isApproving || isDeleting || importing}
                onClick={() => setConfirmAction('approveAll')}
              >
                <FormattedMessage
                  {...messages.approveAllInputs}
                  values={{ numIdeas }}
                />
              </ButtonWithLink>
            </Box>
            <Box px="12px" py="10px">
              <ButtonWithLink
                buttonStyle="admin-dark-outlined"
                icon="delete"
                processing={isDeleting}
                disabled={isApproving || isDeleting || importing}
                onClick={() => setConfirmAction('removeAll')}
              >
                <FormattedMessage {...messages.removeAllInputs} />
              </ButtonWithLink>
            </Box>
          </Box>
        </Box>
        {approvals.not_approved > 0 && (
          <Error
            text={formatMessage(messages.inputsNotApproved, {
              numNotApproved: approvals.not_approved,
            })}
            marginTop="0px"
            showBackground={false}
            showIcon={true}
          />
        )}
      </Box>

      <Box
        flex="1"
        minHeight="0"
        display="flex"
        px="40px"
        justifyContent="space-between"
      >
        <Box
          w="25%"
          borderRight={`1px ${colors.grey400} solid`}
          pr="8px"
          overflowY="scroll"
        >
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {(importing || importFailed || isLoadingIdeas) && (
            <Box
              py="8px"
              borderBottom={`1px ${colors.grey400} solid`}
              position="relative"
            >
              {importErrors.length > 0 ? (
                <>
                  <Error
                    text={formatMessage(messages.errorImporting)}
                    showIcon={false}
                  />
                  {importErrors.map((error, index) => (
                    <Error key={index} apiErrors={[error]} />
                  ))}
                </>
              ) : (
                <Box
                  justifyContent="flex-start"
                  alignItems="center"
                  display="flex"
                >
                  <Box mr="8px">
                    <Spinner size="20px" />
                  </Box>
                  <Text m="0" color="black" fontSize="m">
                    <FormattedMessage {...messages.importing} />
                  </Text>
                </Box>
              )}
            </Box>
          )}
          <IdeaList
            ideaId={ideaId}
            ideas={ideas}
            onSelectIdea={handleSelectIdea}
            onDeleteIdea={handleDeleteIdea}
          />
          <RecentlyApprovedList
            ideas={approvedThisSession}
            onUndo={handleUndoApproval}
            undoingId={undoingId}
          />
        </Box>
        <Box
          w="35%"
          borderRight={`1px ${colors.grey400} solid`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          h="100%"
        >
          <IdeaEditor
            ideaId={ideaId}
            setIdeaId={setIdeaId}
            onIdeaApproved={handleIdeaApproved}
          />
        </Box>
        <Box w="40%">
          {ideaMetadata && ideaId && importType === 'pdf' && (
            <PDFViewer
              file={ideaMetadata.data.attributes.file.url}
              ideaId={ideaId}
            />
          )}
          {importType === 'xlsx' && (
            <Box w="100%" h="100%" m="16px">
              <Text>
                <FormattedMessage {...messages.pdfNotAvailable} />
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      <WarningModal
        open={confirmAction !== null}
        isLoading={isApproving || isDeleting}
        title={
          confirmAction === 'approveAll'
            ? formatMessage(messages.confirmApproveAll)
            : formatMessage(messages.confirmRemoveAll)
        }
        explanation={
          confirmAction === 'approveAll'
            ? formatMessage(messages.confirmApproveAllExplanation, {
                numIdeas,
              })
            : formatMessage(messages.confirmRemoveAllExplanation)
        }
        onClose={() => setConfirmAction(null)}
        onConfirm={
          confirmAction === 'approveAll' ? handleApproveAll : handleDeleteAll
        }
      />
    </Box>
  );
};

export default ReviewSection;
