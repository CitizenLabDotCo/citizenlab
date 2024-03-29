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
    const isPhoneOrSmaller = useBreakpoint('phone');

    const mobileLeft = isPhoneOrSmaller && !theme.isRtl ? '-70px' : 'auto';

    return (
      <Box
        display={isPhoneOrSmaller ? 'block' : 'flex'}
        justifyContent="space-between"
        pb="14px"
        borderBottom="solid 1px #ccc"
        mb="28px"
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      >
        <Title color={'tenantText'} m="0px" my="auto" variant="h3" as="h1">
          {title}
        </Title>
        <ProjectFilterDropdownPositioner>
          <Box
            display="flex"
            flexWrap="wrap"
            flexDirection={isPhoneOrSmaller ? 'row-reverse' : 'row'}
            gap="8px"
            mt="8px"
            ml="auto"
          >
            {showDateFilter && (
              <Box
                width={isPhoneOrSmaller ? '100%' : 'auto'}
                flexShrink={0}
                style={{ textAlign: 'right' }}
              >
                <DateFilterDropdown
                  onChange={setDateFilter}
                  textColor={theme.colors.tenantText}
                  listTop="44px"
                  mobileLeft={isPhoneOrSmaller ? '-70px' : mobileLeft}
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
                mobileLeft={isPhoneOrSmaller && !theme.isRtl ? '-70px' : 'auto'}
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
