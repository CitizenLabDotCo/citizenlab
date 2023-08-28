import React, { useState } from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';
import usePhase from 'api/phases/usePhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../TopBar/messages';

// components
import {
  Box,
  Spinner,
  Title,
  Text,
  Button,
} from '@citizenlab/cl2-component-library';
import IdeaList from './IdeaList';
import AuthorBox from './AuthorBox';
import IdeaForm from './IdeaForm';
import PDFPageControl from './PDFPageControl';
import PDFViewer from 'containers/Admin/projects/project/offlineInputs/ReviewSection/PDFViewer';

// styling
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { getFullName } from 'utils/textUtils';
import { canContainIdeas } from 'api/phases/utils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

interface Props {
  phaseId?: string;
  ideaId: string | null;
  showAllErrors: boolean;
  apiErrors?: CLErrors;
  formData: FormData;
  loadingApproveIdea: boolean;
  onSelectIdea: (ideaId: string) => void;
  setFormData: (formData: FormData) => void;
  onApproveIdea?: () => void;
}

const ReviewSection = ({
  phaseId,
  ideaId,
  showAllErrors,
  apiErrors,
  formData,
  loadingApproveIdea,
  onSelectIdea,
  setFormData,
  onApproveIdea,
}: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const { data: ideas, isLoading } = useImportedIdeas({ projectId });
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: author } = useUserById(
    idea?.data.relationships.author?.data?.id,
    false
  );
  const { data: phase } = usePhase(phaseId);

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

  if (ideas === undefined) return null;

  if (ideas.data.length === 0) {
    return (
      <Box
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px="50px"
      >
        <Box
          w="100%"
          maxWidth="500px"
          h="200px"
          bgColor={colors.white}
          borderRadius={stylingConsts.borderRadius}
          boxShadow={`0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`}
          px="20px"
        >
          <Title variant="h1" color="primary">
            <FormattedMessage {...messages.ideaImporter} />
          </Title>
          <Text>
            <FormattedMessage
              {...messages.noIdeasYet}
              values={{
                importPdf: <FormattedMessage {...sharedMessages.importPdf} />,
              }}
            />
          </Text>
        </Box>
      </Box>
    );
  }

  const pages = ideaMetadata?.data.attributes.page_range.map((page) =>
    Number(page)
  );

  const authorName = author ? getFullName(author.data) : undefined;
  const authorEmail = author?.data.attributes.email;

  const blockApproval = phase ? !canContainIdeas(phase.data) : false;

  const goToNextPage = () => setCurrentPageIndex((index) => index + 1);
  const goToPreviousPage = () => setCurrentPageIndex((index) => index - 1);

  return (
    <Box
      mt="40px"
      w="100%"
      bgColor={colors.white}
      pt="20px"
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Box px="40px" display="flex" justifyContent="space-between">
        <Title variant="h2" color="primary" mt="8px" mb="20px">
          <FormattedMessage {...messages.importedIdeas} />
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
            onDeleteIdea={console.log}
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
          <Box
            px="12px"
            borderBottom={`1px ${colors.grey400} solid`}
            overflowY="scroll"
            w="100%"
            h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 160px)`}
          >
            {(authorEmail || authorName) && (
              <AuthorBox authorName={authorName} authorEmail={authorEmail} />
            )}
            {idea && (
              <IdeaForm
                projectId={projectId}
                showAllErrors={showAllErrors}
                apiErrors={apiErrors}
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </Box>
          <Box
            h="60px"
            px="24px"
            pb="4px"
            w="100%"
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
          >
            {onApproveIdea && (
              <Button
                icon="check"
                w="100%"
                processing={loadingApproveIdea}
                disabled={blockApproval}
                onClick={onApproveIdea}
              >
                Approve
              </Button>
            )}
          </Box>
        </Box>
        <Box w="40%">
          {ideaMetadata && pages && (
            <PDFViewer
              currentPageIndex={currentPageIndex}
              file={ideaMetadata.data.attributes.file.url}
              pages={pages}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReviewSection;
