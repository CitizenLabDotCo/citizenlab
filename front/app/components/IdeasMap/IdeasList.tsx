import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, Spinner } from 'cl2-component-library';
import TopicFilterDropdown from 'components/IdeaCards/TopicFilterDropdown';
import SelectSort from 'components/IdeaCards/SortFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import IdeaMapCard from './IdeaMapCard';

// hooks
import useLocale from 'hooks/useLocale';
// import useWindowSize from 'hooks/useWindowSize';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useProject from 'hooks/useProject';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// i18n
import messages from 'components/IdeaCards/messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';

// typings
import { Sort } from 'resources/GetIdeas';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Loading = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.label};
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 12px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

interface Props {
  projectIds: string[];
  projectId: string;
  phaseId?: string | null;
  className?: string;
}

const IdeasList = memo<Props>(
  ({ projectIds, projectId, phaseId, className }) => {
    const locale = useLocale();
    // const windowSize = useWindowSize();
    const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
    const project = useProject({ projectId });

    const [search, setSearch] = useState<string | null>(null);
    const [topics, setTopics] = useState<string[]>([]);
    const [sort, setSort] = useState<Sort>(
      project?.attributes.ideas_order || ideaDefaultSortMethodFallback
    );

    const ideas = useIdeaMarkers({ projectIds, phaseId, sort, search, topics });

    const isFieldEnabled = (fieldCode: CustomFieldCodes) => {
      if (!isNilOrError(ideaCustomFieldsSchemas) && !isNilOrError(locale)) {
        return (
          ideaCustomFieldsSchemas.ui_schema_multiloc?.[locale]?.[fieldCode]?.[
            'ui:widget'
          ] !== 'hidden'
        );
      }

      return true;
    };

    const topicsEnabled = isFieldEnabled('topic_ids');

    const handleSearchOnChange = (newSearchValue: string) => {
      setSearch(newSearchValue || null);
    };

    const handleSortOnChange = (newSort: Sort) => {
      setSort(newSort);
    };

    const handleTopicsOnChange = (newTopics: string[]) => {
      setTopics(newTopics);
    };

    return (
      <Container className={className || ''}>
        <Header>
          <DropdownFilters>
            <SelectSort
              onChange={handleSortOnChange}
              alignment="left"
              defaultSortingMethod={
                project?.attributes.ideas_order || ideaDefaultSortMethodFallback
              }
            />
            {topicsEnabled && (
              <TopicFilterDropdown
                onChange={handleTopicsOnChange}
                alignment="left"
                projectId={!isNilOrError(project) ? project.id : null}
              />
            )}
          </DropdownFilters>

          <StyledSearchInput onChange={handleSearchOnChange} />
        </Header>

        <IdeaMapCards>
          {ideas === undefined && (
            <Loading>
              <Spinner />
            </Loading>
          )}

          {ideas &&
            ideas.length > 0 &&
            ideas.map((idea) => (
              <StyledIdeaMapCard ideaId={idea.id} key={idea.id} />
            ))}

          {(ideas === null || ideas?.length === 0) && (
            <EmptyContainer id="ideas-empty">
              <IdeaIcon ariaHidden name="idea" />
              <EmptyMessage>
                <EmptyMessageLine>
                  <FormattedMessage {...messages.noFilteredResults} />
                </EmptyMessageLine>
              </EmptyMessage>
            </EmptyContainer>
          )}
        </IdeaMapCards>
      </Container>
    );
  }
);

export default IdeasList;
