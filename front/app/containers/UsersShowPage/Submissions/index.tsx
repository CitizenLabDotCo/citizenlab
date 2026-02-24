import React, { useMemo } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IdeaSortMethod } from 'api/phases/types';
import { IdeaSortMethodFallback } from 'api/phases/utils';
import useUserIdeasCount from 'api/user_ideas_count/useUserIdeasCount';
import useUserBySlug from 'api/users/useUserBySlug';

import { IdeaCardsWithoutFiltersSidebar } from 'components/IdeaCards';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams, useSearch } from '@tanstack/react-router';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

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
  const { sort, search } = useSearch({ strict: false });
  const { data: ideasCount } = useUserIdeasCount({ userId: user?.data.id });
  const isSmallerThanPhone = useBreakpoint('phone');
  const ideaQueryParameters = useMemo<QueryParameters>(
    () => ({
      'page[number]': 1,
      'page[size]': 24,
      author: user?.data.id || '',
      sort: sort ?? IdeaSortMethodFallback,
      search: search ?? undefined,
    }),
    [user, sort, search]
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
