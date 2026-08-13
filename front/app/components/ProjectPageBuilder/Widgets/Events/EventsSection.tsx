import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEvents } from 'api/events/types';

import EventCard from 'components/EventCards/EventCard';
import Pagination from 'components/Pagination';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr));
  gap: 16px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 24px auto 0px;
`;

type Props = {
  title: MessageDescriptor;
  events: IEvents;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const EventsSection = ({ title, events, currentPage, onPageChange }: Props) => {
  if (events.data.length === 0) {
    return null;
  }

  return (
    <Box>
      <Title variant="h3" color="tenantText" m="0" mb="16px">
        <FormattedMessage {...title} />
      </Title>
      <Grid>
        {events.data.map((event) => (
          <EventCard key={event.id} id={event.id} event={event} />
        ))}
      </Grid>
      <StyledPagination
        currentPage={currentPage}
        totalPages={getPageNumberFromUrl(events.links.last) ?? 1}
        loadPage={onPageChange}
        useColorsTheme
      />
    </Box>
  );
};

export default EventsSection;
