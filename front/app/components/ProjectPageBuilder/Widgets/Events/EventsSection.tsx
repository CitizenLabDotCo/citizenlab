import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IEvents } from 'api/events/types';

import EventCards from 'components/EventCards';
import Pagination from 'components/Pagination';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

const StyledPagination = styled(Pagination)`
  justify-content: center;
  margin: 24px auto 0px;
`;

type Props = {
  id?: string;
  title: MessageDescriptor;
  showTitle?: boolean;
  events: IEvents;
  currentPage: number;
  onPageChange: (page: number) => void;
  showPagination?: boolean;
};

const EventsSection = ({
  id,
  title,
  showTitle = true,
  events,
  currentPage,
  onPageChange,
  showPagination = true,
}: Props) => {
  if (events.data.length === 0) {
    return null;
  }

  return (
    <Box id={id}>
      {showTitle && (
        <Title variant="h3" color="tenantText" m="0" mb="16px">
          <FormattedMessage {...title} />
        </Title>
      )}
      <EventCards events={events} />
      {showPagination && (
        <StyledPagination
          currentPage={currentPage}
          totalPages={getPageNumberFromUrl(events.links.last) ?? 1}
          loadPage={onPageChange}
          useColorsTheme
        />
      )}
    </Box>
  );
};

export default EventsSection;
