import React, { memo } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import ProjectFilterDropdown from 'components/ProjectFilterDropdown';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import DateFilterDropdown from './DateFilterDropdown';

import { dateFilterKey } from '.';

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
`;

interface Props {
  title: string;
  showProjectFilter: boolean;
  showDateFilter?: boolean;
  setProjectIds: (projectIds: string[]) => void;
  setDateFilter: (dateFilter: dateFilterKey[]) => void;
  dateFilter: dateFilterKey[];
  eventsTime?: 'past' | 'currentAndFuture';
}

const TopBar = memo<Props>(
  ({
    title,
    showProjectFilter,
    showDateFilter,
    setProjectIds,
    setDateFilter,
    dateFilter,
    eventsTime,
  }) => {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    const isSmallerThanPhone = useBreakpoint('phone');

    const mobileLeft = isSmallerThanPhone && !theme.isRtl ? '-70px' : 'auto';

    return (
      <Box
        display={isSmallerThanPhone ? 'block' : 'flex'}
        justifyContent="space-between"
        pb="14px"
        borderBottom="solid 1px #ccc"
        mb="28px"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      >
        <Title
          variant="h2"
          color="tenantText"
          m="0px"
          my="auto"
          fontSize={isSmallerThanPhone ? 'xl' : 'xxl'}
        >
          {title}
        </Title>
        <ProjectFilterDropdownPositioner>
          <Box
            display="flex"
            flexWrap="wrap"
            flexDirection={isSmallerThanPhone ? 'row-reverse' : 'row'}
            gap="8px"
            mt="8px"
            ml="auto"
          >
            {showDateFilter && (
              <Box
                width={isSmallerThanPhone ? '100%' : 'auto'}
                flexShrink={0}
                style={{ textAlign: 'right' }}
              >
                <DateFilterDropdown
                  onChange={setDateFilter}
                  selectedValues={dateFilter}
                  textColor={theme.colors.tenantText}
                  listTop="44px"
                  mobileLeft={isSmallerThanPhone ? '-70px' : mobileLeft}
                />
              </Box>
            )}
            {showProjectFilter && (
              <ProjectFilterDropdown
                title={formatMessage(messages.filterDropdownTitle)}
                onChange={setProjectIds}
                textColor={theme.colors.tenantText}
                filterSelectorStyle="button"
                listTop="44px"
                mobileLeft={
                  isSmallerThanPhone && !theme.isRtl ? '-70px' : 'auto'
                }
                eventsTime={eventsTime}
              />
            )}
          </Box>
        </ProjectFilterDropdownPositioner>
      </Box>
    );
  }
);

export default TopBar;
