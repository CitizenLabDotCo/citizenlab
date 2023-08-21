import React from 'react';
import moment from 'moment';

// routing
import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// api
import useImportedIdeas from 'api/import_ideas/useImportedIdeas';
import useImportedIdeaMetadata from 'api/import_ideas/useImportedIdeaMetadata';
import useIdeaById from 'api/ideas/useIdeaById';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Spinner, Title, Text } from '@citizenlab/cl2-component-library';
import IdeaForm from './IdeaForm';
import PDFViewer from 'components/PDFViewer';

// styling
import styled from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// TODO move to component library
const TEAL50 = '#EDF8FA';

const StyledBox = styled(Box)`
  &:hover {
    background-color: ${TEAL50};
  }
`;

const ReviewSection = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('idea_id');

  const { data: ideas, isLoading } = useImportedIdeas({ projectId });
  const { data: idea } = useIdeaById(ideaId ?? undefined);

  const { data: ideaMetadata } = useImportedIdeaMetadata({
    id: idea?.data.relationships.idea_import?.data?.id,
  });

  const localize = useLocalize();

  if (isLoading) {
    return (
      <Box w="100%" mt="160px" display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (ideas === undefined || ideas.data.length === 0) return null;

  const pages = ideaMetadata?.data.attributes.page_range.map((page) =>
    Number(page)
  );

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
        Ideas imported
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
                // horrible hack to make this work. TODO fix
                removeSearchParams(['idea_id']);

                setTimeout(() => {
                  updateSearchParams({ idea_id: idea.id });
                }, 200);
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
          justifyContent="center"
          px="12px"
        >
          {idea && ideaId && (
            <IdeaForm
              projectId={projectId}
              ideaId={idea.data.id}
              title_multiloc={idea.data.attributes.title_multiloc}
              body_multiloc={idea.data.attributes.body_multiloc}
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
