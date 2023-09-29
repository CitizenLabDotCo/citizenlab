import React, { useState } from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useIdeaById from 'api/ideas/useIdeaById';
import useInputSchema from 'hooks/useInputSchema';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Box, Spinner, Title, Text } from '@citizenlab/cl2-component-library';
import EmptyState from './EmptyState';
import IdeaList from './IdeaList';
import IdeaEditor from './IdeaEditor';
import PDFPageControl from './PDFPageControl';
import PDFViewer from './PDFViewer';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

interface Props {
  ideaId: string | null;
  apiErrors?: CLErrors;
  formData: FormData;
  formDataValid: boolean;
  loadingApproveIdea: boolean;
  onSelectIdea: (ideaId: string | null) => void;
  setFormData: (formData: FormData) => void;
  onApproveIdea: () => Promise<void>;
  onDeleteIdea: (ideaId: string) => void;
}

const ReviewSection = ({
  ideaId,
  apiErrors,
  formData,
  formDataValid,
  loadingApproveIdea,
  onSelectIdea,
  setFormData,
  onApproveIdea,
  onDeleteIdea,
}: Props) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });
  const { data: ideas, isLoading } = useImportedIdeas({ projectId, phaseId });
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: isLoading ? undefined : idea?.data.relationships.idea_import?.data?.id,
  });

  if (isLoading) {
    return (
      <Box w="100%" mt="160px" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (!schema || !uiSchema) return null;
  if (ideas === undefined) return null;
  if (ideas.data.length === 0) {
    return <EmptyState />;
  }

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
            onSelectIdea={onSelectIdea}
            onDeleteIdea={onDeleteIdea}
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
            apiErrors={apiErrors}
            formData={formData}
            formDataValid={formDataValid}
            loadingApproveIdea={loadingApproveIdea}
            setFormData={setFormData}
            onApproveIdea={onApproveIdea}
          />
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
