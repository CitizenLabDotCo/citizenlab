import React, { memo, useCallback, useState } from 'react';
import { get, isEmpty } from 'lodash-es';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// components
import ProjectTemplateCard from './ProjectTemplateCard';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
// import ProjectTemplatePreview from './ProjectTemplatePreview';
// import SideModal from 'components/UI/SideModal';
// import Modal from 'components/UI/Modal';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import DepartmentFilter from './DepartmentFilter';
import PurposeFilter from './PurposeFilter';
import ParticipationLevelFilter from './ParticipationLevelFilter';

const Container = styled.div`
  margin-bottom: 15px;
`;

const Filters = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Left = styled.div``;

const Right = styled.div``;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
`;

const Cards = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const StyledProjectTemplateCard = styled(ProjectTemplateCard)`
  flex-grow: 0;
  width: calc(100% * (1/3) - 18px);
  margin-right: 27px;

  &:nth-child(3n) {
    margin-right: 0px;
  }
`;

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`;

const LoadMoreButton = styled(Button)``;

interface Props {
  className?: string;
}

const ProjectTemplateCards = memo<Props & InjectedIntlProps>(({ intl, className }) => {

  const searchPlaceholder = intl.formatMessage(messages.searchPlaceholder);
  const searchAriaLabel = intl.formatMessage(messages.searchPlaceholder);

  const TEMPLATES_QUERY = gql`
    query PublishedProjectTemplatesQuery(
      $cursor: String,
      $departments: [ID!],
      $purposes: [ID!],
      $participationLevels: [ID!],
      $search: String
    ) {
      publishedProjectTemplates(
        first: 6,
        after: $cursor,
        departments: $departments,
        purposes: $purposes,
        participationLevels: $participationLevels,
        search: $search
      ) {
        edges {
          node {
            id,
            cardImage,
            titleMultiloc {
              en
            },
            subtitleMultiloc {
              en
            }
          }
          cursor
        }
        pageInfo{
          endCursor
          hasNextPage
        }
      }
    }
  `;

  const [departments, setDepartments] = useState<string[] | null>(null);
  const [purposes, setPurposes] = useState<string[] | null>(null);
  const [participationLevels, setParticipationLevels] = useState<string[] | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const { data, fetchMore } = useQuery(TEMPLATES_QUERY, {
    variables: {
      departments,
      purposes,
      participationLevels,
      search,
      cursor: null,
    },
  });

  const templates = get(data, 'publishedProjectTemplates', null);

  const handleDepartmentFilterOnChange = useCallback((departments: string[]) => {
    setDepartments(departments && departments.length > 0 ? departments : null);
  }, []);

  const handlePurposeFilterOnChange = useCallback((purposes: string[]) => {
    setPurposes(purposes && purposes.length > 0 ? purposes : null);
  }, []);

  const handleParticipationLevelFilterOnChange = useCallback((participationLevels: string[]) => {
    setParticipationLevels(participationLevels && participationLevels.length > 0 ? participationLevels : null);
  }, []);

  const handleSearchOnChange = useCallback((searchValue: string) => {
    setSearch(!isEmpty(searchValue) ? searchValue : null);
  }, []);

  const handleLoadMoreTemplatesOnClick = useCallback(() => {
    setLoadingMore(true);

    fetchMore({
      variables: {
        departments,
        purposes,
        participationLevels,
        search,
        cursor: templates.pageInfo.endCursor
      },
      updateQuery: (previousResult, { fetchMoreResult }: { fetchMoreResult: any }) => {
        const newEdges = fetchMoreResult.publishedProjectTemplates.edges;
        const pageInfo = fetchMoreResult.publishedProjectTemplates.pageInfo;

        return newEdges.length
          ? {
              publishedProjectTemplates: {
                pageInfo,
                __typename: templates.__typename,
                edges: [...templates.edges, ...newEdges]
              }
            }
          : previousResult;
      }
    }).then(() => {
      setLoadingMore(false);
    }).catch(() => {
      setLoadingMore(false);
    });
  }, [templates]);

  const handlePreviewOnOpen = useCallback((projectTemplateId: string) => {
    setPreviewTemplateId(projectTemplateId);
  }, []);

  const handlePreviewOnClose = useCallback(() => {
    setPreviewTemplateId(null);
  }, []);

  if (templates) {
    return (
      <Container className={className}>
        <Filters>
          <Left>
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
            <PurposeFilter onChange={handlePurposeFilterOnChange} />
            <ParticipationLevelFilter onChange={handleParticipationLevelFilterOnChange} />
          </Left>

          <Right>
            <StyledSearchInput
              placeholder={searchPlaceholder}
              ariaLabel={searchAriaLabel}
              value={search}
              onChange={handleSearchOnChange}
            />
          </Right>
        </Filters>

        <Cards>
          {templates.edges.map(({ node: { id, titleMultiloc, subtitleMultiloc, cardImage } }) => {
            return (
              <StyledProjectTemplateCard
                key={id}
                projectTemplateId={id}
                imageUrl={cardImage}
                title={titleMultiloc.en}
                body={subtitleMultiloc.en}
                onPreviewButtonClick={handlePreviewOnOpen}
              />
            );
          })}
        </Cards>

        {get(templates, 'pageInfo.hasNextPage') &&
          <LoadMoreButtonWrapper>
            <LoadMoreButton
              processing={loadingMore}
              onClick={handleLoadMoreTemplatesOnClick}
              style="secondary"
            >
              <FormattedMessage {...messages.loadMoreTemplates} />
            </LoadMoreButton>
          </LoadMoreButtonWrapper>
        }

        {/*
        <SideModal
          opened={!!previewTemplateId}
          close={handlePreviewOnClose}
        >
          {previewTemplateId && <ProjectTemplatePreview projectTemplateId={previewTemplateId} />}
        </SideModal>
        */}

        {/*
        <Modal
          opened={!!previewTemplateId}
          close={handlePreviewOnClose}
        >
          {previewTemplateId && <ProjectTemplatePreview projectTemplateId={previewTemplateId} />}
        </Modal>
        */}

      </Container>
    );
  }

  return null;
});

export default injectIntl(ProjectTemplateCards);
