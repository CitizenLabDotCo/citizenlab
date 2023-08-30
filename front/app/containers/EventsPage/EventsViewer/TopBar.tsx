import React, { memo } from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import DateFilterDropdown from './DateFilterDropdown';

// styling
import styled, { useTheme } from 'styled-components';

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
  setDateFilter: (dateFilter: string[]) => void;
  eventsTime?: 'past' | 'currentAndFuture';
}

const TopBar = memo<Props>(
  ({
    title,
    showProjectFilter,
    showDateFilter,
    setProjectIds,
    setDateFilter,
    eventsTime,
  }) => {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    const isMobileOrSmaller = useBreakpoint('phone');

    const mobileLeft = isMobileOrSmaller && !theme.isRtl ? '-70px' : 'auto';

    return (
      <Box
        display={isMobileOrSmaller ? 'block' : 'flex'}
        justifyContent="space-between"
        pb="14px"
        borderBottom="solid 1px #ccc"
        mb="29px"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      >
        <Title color={'tenantText'} m="0px" my="auto" variant="h3" as="h1">
          {title}
        </Title>
        <ProjectFilterDropdownPositioner>
          <Box display="flex" mt="8px" ml="auto">
            {showDateFilter && (
              <DateFilterDropdown
                onChange={setDateFilter}
                textColor={theme.colors.tenantText}
                listTop="44px"
                mobileLeft={showProjectFilter ? '0px' : mobileLeft}
              />
            )}
            {showProjectFilter && (
              <>
                <ProjectFilterDropdown
                  title={formatMessage(messages.filterDropdownTitle)}
                  onChange={setProjectIds}
                  textColor={theme.colors.tenantText}
                  filterSelectorStyle="button"
                  listTop="44px"
                  mobileLeft={
                    isMobileOrSmaller && !theme.isRtl ? '-70px' : 'auto'
                  }
                  eventsTime={eventsTime}
                />
              </>
            )}
          </Box>
        </ProjectFilterDropdownPositioner>
      </Box>
    );
  }
);

export default TopBar;
