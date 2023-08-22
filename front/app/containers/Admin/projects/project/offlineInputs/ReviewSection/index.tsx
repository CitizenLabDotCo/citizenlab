import React from 'react';
import moment from 'moment';

// routing
import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useIdeaById from 'api/ideas/useIdeaById';
import useUserById from 'api/users/useUserById';

// i18n
import useLocalize from 'hooks/useLocalize';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Box, Spinner, Title, Text } from '@citizenlab/cl2-component-library';
import IdeaForm from './IdeaForm';
import PDFViewer from 'components/PDFViewer';

// styling
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

// utils
import { getFullName } from 'utils/textUtils';

// typings
import { FormData } from 'components/Form/typings';
import { CLErrors } from 'typings';

// TODO move to component library
const TEAL50 = '#EDF8FA';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${TEAL50};
  }
`;

interface Props {
  showAllErrors: boolean;
  apiErrors?: CLErrors;
  formData: FormData;
  setFormData: (formData: FormData) => void;
}

const ReviewSection = ({
  showAllErrors,
  apiErrors,
  formData,
  setFormData,
}: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('idea_id');

  const { data: ideas, isLoading } = useImportedIdeas({ projectId });
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const { data: author } = useUserById(
    idea?.data.relationships.author?.data?.id,
    false
  );

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: isLoading ? undefined : idea?.data.relationships.idea_import?.data?.id,
  });

  const localize = useLocalize();

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
                importPdf: <FormattedMessage {...messages.importPdf} />,
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

  const authorEmail = author?.data.attributes.email;
  const authorName = author ? getFullName(author.data) : undefined;

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
      <Title variant="h2" color="primary" px="40px" mb="40px">
        <FormattedMessage {...messages.importedIdeas} />
      </Title>

      <Box
        h={`calc(100vh - ${stylingConsts.mobileMenuHeight}px - 140px)`}
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
          {ideas.data.map((idea) => (
            <StyledBox
              key={idea.id}
              py="8px"
              borderBottom={`1px ${colors.grey400} solid`}
              style={{ cursor: 'pointer' }}
              bgColor={idea.id === ideaId ? TEAL50 : undefined}
              onClick={() => {
                updateSearchParams({ idea_id: idea.id });
              }}
            >
              <Text
                m="0"
                color="black"
                fontSize="m"
                fontWeight={idea.id === ideaId ? 'bold' : 'normal'}
              >
                {localize(idea.attributes.title_multiloc)}
              </Text>
              <Text m="0" mt="3px" fontSize="s" color="grey600">
                {moment(idea.attributes.created_at).format('YYYY-MM-DD')}
              </Text>
            </StyledBox>
          ))}
        </Box>
        <Box
          w="35%"
          borderRight={`1px ${colors.grey400} solid`}
          overflowY="scroll"
          display="flex"
          flexDirection="column"
          alignItems="center"
          px="12px"
        >
          {(authorEmail || authorName) && (
            <Box
              w="90%"
              mb="20px"
              borderBottom={`1px solid ${colors.borderLight}`}
            >
              {authorEmail && <Text mt="0">{authorEmail}</Text>}
              {authorName && <Text>{authorName}</Text>}
            </Box>
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
        <Box w="40%">
          {ideaMetadata && pages && (
            <PDFViewer
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
