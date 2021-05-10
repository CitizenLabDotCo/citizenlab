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
import useWindowSize from 'hooks/useWindowSize';
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
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';

// typings
import { Sort } from 'resources/GetIdeas';
import { CustomFieldCodes } from 'services/ideaCustomFieldsSchemas';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
`;

const FiltersArea = styled.div`
  width: 100%;
  min-height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
`;

const LeftFilterArea = styled(FilterArea)`
  flex: 1 1 auto;

  &.hidden {
    display: none;
  }

  ${media.smallerThanMinTablet`
    display: flex;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const RightFilterArea = styled(FilterArea)`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;

  &.hidden {
    display: none;
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 200px;
  margin-right: 30px;

  ${isRtl`
    margin-right: 0;
    margin-left: auto;
  `}

  ${media.smallerThanMinTablet`
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
    margin-bottom: 20px;
  `}
`;

const List = styled.div`
  margin-left: -12px;
  margin-right: -12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)``;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  ${defaultCardStyle};
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

const ListView = styled.div``;

interface Props {
  projectIds: string[];
  projectId: string;
  phaseId?: string | null;
  className?: string;
}

const IdeasList = memo<Props>(
  ({ projectIds, projectId, phaseId, className }) => {
    const locale = useLocale();
    const windowSize = useWindowSize();
    const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({ projectId });
    const project = useProject({ projectId });

    const [search, setSearch] = useState<string>('');
    const [topics, setTopics] = useState<string[]>([]);
    const [sort, setSort] = useState<Sort>(
      project?.attributes.ideas_order || ideaDefaultSortMethodFallback
    );

    const ideas = useIdeaMarkers({ projectIds, phaseId, sort });

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
      setSearch(newSearchValue);
    };

    const handleSortOnChange = (newSort: Sort) => {
      setSort(newSort);
    };

    const handleTopicsOnChange = (newTopics: string[]) => {
      setTopics(newTopics);
    };

    return (
      <Container className={className || ''}>
        <FiltersArea className={`ideasContainer`}>
          <LeftFilterArea>
            <StyledSearchInput onChange={handleSearchOnChange} />
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters>
              <SelectSort
                onChange={handleSortOnChange}
                alignment="right"
                defaultSortingMethod={
                  project?.attributes.ideas_order ||
                  ideaDefaultSortMethodFallback
                }
              />
              {topicsEnabled && (
                <TopicFilterDropdown
                  onChange={handleTopicsOnChange}
                  alignment="right"
                  projectId={!isNilOrError(project) ? project.id : null}
                />
              )}
            </DropdownFilters>
          </RightFilterArea>
        </FiltersArea>

        <ListView>
          {ideas === undefined ? (
            <Loading id="ideas-loading">
              <Spinner />
            </Loading>
          ) : (
            <>
              {ideas && ideas.length > 0 ? (
                <List>
                  {ideas.map((idea) => (
                    <StyledIdeaMapCard ideaId={idea.id} />
                  ))}
                </List>
              ) : (
                <EmptyContainer id="ideas-empty">
                  <IdeaIcon ariaHidden name="idea" />
                  <EmptyMessage>
                    <EmptyMessageLine>
                      <FormattedMessage {...messages.noFilteredResults} />
                    </EmptyMessageLine>
                  </EmptyMessage>
                </EmptyContainer>
              )}
            </>
          )}
        </ListView>
      </Container>
    );
  }
);

export default IdeasList;
