import React, { memo, useCallback } from 'react';

// components
import { Icon, Spinner } from '@citizenlab/cl2-component-library';
import TopicFilterDropdown from 'components/IdeaCards/shared/Filters/TopicFilterDropdown';
import SelectSort, {
  Sort,
} from 'components/IdeaCards/shared/Filters/SortFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import IdeaMapCard from '../IdeaMapCard';
import Centerer from 'components/UI/Centerer';

// hooks
import useLocale from 'hooks/useLocale';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useProjectById from 'api/projects/useProjectById';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import usePhase from 'api/phases/usePhase';

// router
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// utils
import { isFieldEnabled } from 'utils/projectUtils';
import { isNilOrError } from 'utils/helperUtils';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  border-bottom: solid 1px #ccc;
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledSearchInput = styled(SearchInput)`
  width: 100%;
`;

const IdeaMapCards = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)`
  margin-left: 20px;
  margin-right: 20px;
`;

const EmptyContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 100px;
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.textSecondary};
`;

const EmptyMessage = styled.div`
  padding-left: 50px;
  padding-right: 50px;
  margin-top: 12px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

interface Props {
  projectId: string;
  phaseId?: string;
  className?: string;
}

const MapIdeasList = memo<Props>(({ projectId, phaseId, className }) => {
  const locale = useLocale();
  const [searchParams] = useSearchParams();

  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    phaseId,
  });
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const sort =
    (searchParams.get('sort') as Sort | null) ??
    project?.data.attributes.ideas_order ??
    ideaDefaultSortMethodFallback;
  const search = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const topics: string[] = topicsParam ? JSON.parse(topicsParam) : [];

  const { data: ideaMarkers } = useIdeaMarkers({
    projectIds: [projectId],
    phaseId,
    sort,
    search,
    topics,
  });

  const handleSearchOnChange = useCallback((search: string | null) => {
    updateSearchParams({ search });
  }, []);

  const handleSortOnChange = useCallback((sort: Sort) => {
    updateSearchParams({ sort });
  }, []);

  const handleTopicsOnChange = useCallback((topics: string[]) => {
    topics.length === 0
      ? updateSearchParams({ topics: undefined })
      : updateSearchParams({ topics });
  }, []);

  const isFiltered = (search && search.length > 0) || topics.length > 0;

  if (isNilOrError(ideaCustomFieldsSchema)) return null;

  const methodConfig =
    project &&
    getMethodConfig(
      phase?.data.attributes?.participation_method ||
        project?.data.attributes?.participation_method
    );

  const topicsEnabled = isFieldEnabled(
    'topic_ids',
    ideaCustomFieldsSchema.data.attributes,
    locale
  );

  return (
    <Container className={className || ''}>
      {methodConfig?.showIdeaFilters && (
        <Header>
          <DropdownFilters>
            <SelectSort
              value={sort}
              onChange={handleSortOnChange}
              alignment="left"
            />
            {topicsEnabled && (
              <TopicFilterDropdown
                selectedTopicIds={topics}
                onChange={handleTopicsOnChange}
                alignment="left"
                projectId={projectId}
              />
            )}
          </DropdownFilters>

          <StyledSearchInput
            defaultValue={search ?? undefined}
            onChange={handleSearchOnChange}
            a11y_numberOfSearchResults={
              ideaMarkers && ideaMarkers.data.length > 0
                ? ideaMarkers.data.length
                : 0
            }
          />
        </Header>
      )}

      <IdeaMapCards>
        {ideaMarkers === undefined && (
          <Centerer>
            <Spinner />
          </Centerer>
        )}

        {ideaMarkers &&
          ideaMarkers.data.length > 0 &&
          ideaMarkers.data.map((ideaMarker) => (
            <StyledIdeaMapCard
              projectId={projectId}
              ideaMarker={ideaMarker}
              key={ideaMarker.id}
              phaseId={phaseId}
            />
          ))}

        {(ideaMarkers === null || ideaMarkers?.data.length === 0) && (
          <EmptyContainer>
            <IdeaIcon ariaHidden name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage
                  {...(isFiltered
                    ? messages.noFilteredResults
                    : messages.noResults)}
                />
              </EmptyMessageLine>
            </EmptyMessage>
          </EmptyContainer>
        )}
      </IdeaMapCards>
    </Container>
  );
});

export default MapIdeasList;
