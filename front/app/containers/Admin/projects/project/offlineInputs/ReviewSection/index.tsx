import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';

import { FormattedMessage } from 'utils/cl-intl';

import EmptyState from './EmptyState';
import IdeaEditor from './IdeaEditor';
import IdeaList from './IdeaList';
import messages from './messages';
import PDFPageControl from './PDFPageControl';
import PDFViewer from './PDFViewer';

const ReviewSection = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const [ideaId, setIdeaId] = useState<string | null>(null);

  const { data: idea } = useIdeaById(ideaId ?? undefined, false);
  const { data: ideas, isLoading } = useImportedIdeas({ projectId, phaseId });
  const { mutate: deleteIdea } = useDeleteIdea();

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: isLoading ? undefined : idea?.data.relationships.idea_import?.data?.id,
  });

  if (ideas === undefined) return null;
  if (ideas.data.length === 0) {
    return <EmptyState />;
  }

  const handleSelectIdea = (ideaId: string) => {
    setCurrentPageIndex(0);
    setIdeaId(ideaId);
  };

  const handleDeleteIdea = (idToBeDeleted: string) => {
    deleteIdea(idToBeDeleted, {
      onSuccess: () => {
        if (ideaId === idToBeDeleted) {
          setIdeaId(null);
          setCurrentPageIndex(0);
        }
      },
    });
  };

  const pages =
    ideaMetadata?.data.attributes.import_type === 'pdf'
      ? ideaMetadata?.data.attributes.page_range.map((page) => Number(page))
      : null;

  const goToNextPage = () => setCurrentPageIndex((index) => index + 1);
  const goToPreviousPage = () => setCurrentPageIndex((index) => index - 1);

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

        <Box
          w="40%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          {pages && (
            <PDFPageControl
              currentPageNumber={currentPageIndex + 1}
              numberOfPages={pages?.length}
              goToNextPage={goToNextPage}
              goToPreviousPage={goToPreviousPage}
            />
          )}
        </Box>
      </Box>

      <Box
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 100px)`}
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
          {ideaMetadata && pages && (
            <PDFViewer
              currentPageIndex={currentPageIndex}
              file={ideaMetadata.data.attributes.file.url}
              pages={pages}
            />
          )}
          {ideaMetadata?.data.attributes.import_type === 'xlsx' && (
            <Box w="100%" h="100%" m="10px">
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
