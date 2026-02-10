import React, { useMemo } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IdeaSortMethod } from 'api/phases/types';
import { IdeaSortMethodFallback } from 'api/phases/utils';
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import useUserBySlug from 'api/users/useUserBySlug';

import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useParams, useSearch } from 'utils/router';

import messages from '../messages';

interface QueryParameters {
  'page[number]': number;
  'page[size]': number;
  author: string;

  // filters
  search?: string;
  sort: IdeaSortMethod;
}

const Submissions = () => {
  const { userSlug } = useParams({ from: '/$locale/profile/$userSlug' });
  const { data: user } = useUserBySlug(userSlug);
  const [searchParams] = useSearch({ strict: false });
  const sortParam = searchParams.get('sort') as IdeaSortMethod | null;
  const { data: ideasCount } = useUserIdeasCount({ userId: user?.data.id });
  const isSmallerThanPhone = useBreakpoint('phone');
  const searchParam = searchParams.get('search');
  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 24,
      author: user?.data.id || '',
      sort: sortParam ?? IdeaSortMethodFallback,
      search: searchParam ?? undefined,
    }),
    [user, sortParam, searchParam]
  );

  return (
    <Box display="flex" w="100%" flexDirection="column" id="tab-submissions">
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
          ideaQueryParameters={ideaQueryParameters}
          onUpdateQuery={updateSearchParams}
          invisibleTitleMessage={messages.invisibleTitlePostsList}
          showSearchbar
          showDropdownFilters
        />
      </Box>
    </Box>
  );
};

export default Submissions;
