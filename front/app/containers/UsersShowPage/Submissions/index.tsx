import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import messages from '../messages';
import useUserBySlug from 'api/users/useUserBySlug';
import { Sort } from 'components/IdeaCards/shared/Filters/SortFilterDropdown';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

interface QueryParameters {
  // constants
  'page[number]': number;
  'page[size]': number;
  author: string;

  // filters
  search?: string;
  sort: Sort;
}

const Submissions = () => {
  const { userSlug } = useParams() as { userSlug: string };
  const { data: user } = useUserBySlug(userSlug);
  const [searchParams] = useSearchParams();
  const sortParam = searchParams.get('sort') as Sort | null;
  const { data: ideasCount } = useUserIdeasCount({ userId: user?.data.id });
  const isSmallerThanPhone = useBreakpoint('phone');
  const searchParam = searchParams.get('search');
  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 24,
      author: user?.data.id || '',
      sort: sortParam ?? ideaDefaultSortMethodFallback,
      search: searchParam ?? undefined,
    }),
    [user, sortParam, searchParam]
  );

  return (
    <Box display="flex" w="100%" flexDirection="column">
      {isSmallerThanPhone && (
        <Title mt="0px" variant="h3" as="h1">
          <FormattedMessage
            {...messages.postsWithCount}
            values={{
              ideasCount: ideasCount?.data.attributes.count || 0,
            }}
          />
        </Title>
      )}
      <Box display="flex" w="100%" justifyContent="center">
        <IdeaCardsWithoutFiltersSidebar
          defaultSortingMethod={ideaQueryParameters.sort}
          ideaQueryParameters={ideaQueryParameters}
          onUpdateQuery={updateSearchParams}
          invisibleTitleMessage={messages.invisibleTitlePostsList}
          showSearchbar
          showDropdownFilters
          goBackMode="goToProject"
        />
      </Box>
    </Box>
  );
};

export default Submissions;
