import React, { useState } from 'react';

import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';

import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useApprovedImportedIdeas from 'api/import_ideas/useApprovedImportedIdeas';
import useApproveImportedIdeas from 'api/import_ideas/useApproveImportedIdeas';
import useDeleteAllDraftImportedIdeas from 'api/import_ideas/useDeleteAllDraftImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useTrackImportJobProgress from 'api/import_ideas/useTrackImportJobProgress';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import Tabs, {
  getDefaultTabId,
  getDefaultTabPanelId,
} from 'components/UI/FilterTabs';
import WarningModal from 'components/WarningModal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import ApprovedInputsList from './ApprovedInputsList';
import EmptyState from './EmptyState';
import IdeaEditor from './IdeaEditor';
import IdeaList from './IdeaList';
import ImportStatus from './ImportStatus';
import messages from './messages';
import PDFViewer from './PDFViewer';

const ReviewSection = ({
  onClickPDFImport,
  onClickExcelImport,
}: {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}) => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('toReview');
  const [approvals, setApprovals] = useState({ approved: 0, not_approved: 0 });
  const [confirmAction, setConfirmAction] = useState<
    'approveAll' | 'removeAll' | null
  >(null);

  const {
    data: ideas,
    refetch: refetchIdeas,
    isLoading: isLoadingIdeas,
  } = useImportedIdeas({ projectId, phaseId });
  const { data: approvedIdeas, isLoading: isLoadingApprovedIdeas } =
    useApprovedImportedIdeas({ projectId, phaseId });

  const {
    importing,
    importHasErrors,
    importProgress,
    importTotal,
    errorCount,
    importErrors,
  } = useTrackImportJobProgress(phaseId);

  const { mutate: deleteIdea } = useDeleteIdea();
  const { mutate: approveIdeas, isPending: isApproving } =
    useApproveImportedIdeas();
  const { mutate: deleteAllIdeas, isPending: isDeleting } =
    useDeleteAllDraftImportedIdeas();

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: isLoadingIdeas
      ? undefined
      : idea?.data.relationships.idea_import?.data?.id,
  });

  if (ideas === undefined) return null;

  const numIdeas = ideas.data.length;
  const numApprovedIdeas =
    approvedIdeas?.pages.flatMap((page) => page.data).length ?? 0;

  // Past approvals keep the review UI reachable: their list is the way back to
  // an approved input's PDF and answers.
  if (
    !importing &&
    !importHasErrors &&
    numIdeas === 0 &&
    !isLoadingApprovedIdeas &&
    numApprovedIdeas === 0
  ) {
    return (
      <EmptyState
        onClickPDFImport={onClickPDFImport}
        onClickExcelImport={onClickExcelImport}
      />
    );
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

  const tabData = {
    toReview: { label: messages.toReviewTab, count: numIdeas },
    approved: { label: messages.approvedTab },
  };

  const handleApproveAll = () => {
    approveIdeas(phaseId, {
      onSuccess: (data) => {
        setApprovals(data.data.attributes);
        setIdeaId(null);
        setConfirmAction(null);
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
        {/* The bulk actions only act on the pending queue, so they are disabled
            (not hidden, to keep the layout stable) on the Approved tab. */}
        <Box display="flex">
          <Box w="100%" display="flex" alignItems="center">
            <Box pl="15px" py="10px">
              <ButtonWithLink
                bgColor={colors.primary}
                icon="check"
                processing={isApproving}
                disabled={
                  isApproving ||
                  isDeleting ||
                  importing ||
                  currentTab === 'approved'
                }
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
                disabled={
                  isApproving ||
                  isDeleting ||
                  importing ||
                  currentTab === 'approved'
                }
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
          display="flex"
          flexDirection="column"
          minHeight="0"
        >
          <Tabs
            currentTab={currentTab}
            availableTabs={['toReview', 'approved']}
            tabData={tabData}
            onChangeTab={setCurrentTab}
            showCount
            fullWidth
          />
          <Box
            flex="1"
            minHeight="0"
            overflowY="auto"
            role="tabpanel"
            id={getDefaultTabPanelId(currentTab)}
            aria-labelledby={getDefaultTabId(currentTab)}
          >
            {currentTab === 'toReview' ? (
              <>
                {(importing || importHasErrors) && (
                  <ImportStatus
                    hasErrors={importHasErrors}
                    progress={importProgress}
                    total={importTotal}
                    errorCount={errorCount}
                    errors={importErrors}
                  />
                )}
                {!importing &&
                !importHasErrors &&
                numIdeas === 0 &&
                numApprovedIdeas > 0 ? (
                  <Text m="0" p="12px" color="coolGrey600" fontSize="s">
                    <FormattedMessage {...messages.allInputsApprovedHint} />
                  </Text>
                ) : (
                  <IdeaList
                    ideaId={ideaId}
                    ideas={ideas}
                    onSelectIdea={handleSelectIdea}
                    onDeleteIdea={handleDeleteIdea}
                  />
                )}
              </>
            ) : (
              <ApprovedInputsList
                selectedIdeaId={ideaId}
                onSelectIdea={handleSelectIdea}
              />
            )}
          </Box>
        </Box>
        <Box
          w="35%"
          borderRight={`1px ${colors.grey400} solid`}
          display="flex"
          flexDirection="column"
          alignItems="center"
          h="100%"
        >
          <IdeaEditor ideaId={ideaId} setIdeaId={setIdeaId} />
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
