import React, { useState } from 'react';

import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useApproveImportedIdeas from 'api/import_ideas/useApproveImportedIdeas';
import useDeleteAllDraftImportedIdeas from 'api/import_ideas/useDeleteAllDraftImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useTrackImportJobProgress from 'api/import_ideas/useTrackImportJobProgress';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import EmptyState from './EmptyState';
import IdeaEditor from './IdeaEditor';
import IdeaList from './IdeaList';
import ImportStatus from './ImportStatus';
import messages from './messages';
import PDFViewer from './PDFViewer';

const ReviewSection = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState({ approved: 0, not_approved: 0 });

  const {
    data: ideas,
    refetch: refetchIdeas,
    isLoading: isLoadingIdeas,
  } = useImportedIdeas({ projectId, phaseId });

  const {
    importing,
    importHasErrors,
    importProgress,
    importTotal,
    errorCount,
    importErrors,
  } = useTrackImportJobProgress(phaseId);

  const { mutate: deleteIdea } = useDeleteIdea();
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
  if (!importing && !importHasErrors && numIdeas === 0) {
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
        refetchIdeas();
      },
    });
  };

  const handleDeleteAll = () => {
    deleteAllIdeas(phaseId, {
      onSuccess: () => {
        setIdeaId(null);
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
        <Box display="flex">
          <Box w="100%" display="flex" alignItems="center">
            <Box pl="15px" py="10px">
              <ButtonWithLink
                bgColor={colors.primary}
                icon="check"
                processing={isApproving}
                disabled={isApproving || isDeleting || importing}
                onClick={handleApproveAll}
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
                onClick={handleDeleteAll}
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
          {(importing || importHasErrors) && (
            <ImportStatus
              hasErrors={importHasErrors}
              progress={importProgress}
              total={importTotal}
              errorCount={errorCount}
              errors={importErrors}
            />
          )}
          <IdeaList
            ideaId={ideaId}
            ideas={ideas}
            onSelectIdea={handleSelectIdea}
            onDeleteIdea={handleDeleteIdea}
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
    </Box>
  );
};

export default ReviewSection;
