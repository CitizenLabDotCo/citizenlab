import React, { memo } from 'react';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import { Title, useBreakpoint } from '@citizenlab/cl2-component-library';

// styling
import styled, { useTheme } from 'styled-components';
import { isRtl } from 'utils/styleUtils';
import DateFilterDropdown from './DateFilterDropdown';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: solid 1px #ccc;
  margin-bottom: 29px;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const ProjectFilterDropdownPositioner = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
`;

interface Props {
  title: string;
  showProjectFilter: boolean;
  setProjectIds: (projectIds: string[]) => void;
  eventsTime?: 'past' | 'currentAndFuture';
}

const TopBar = memo<Props>(
  ({ title, showProjectFilter, setProjectIds, eventsTime }) => {
    const { formatMessage } = useIntl();
    const theme = useTheme();
    const isMobileOrSmaller = useBreakpoint('phone');

    return (
      <Container>
        <Title color={'tenantText'} m="0px" my="auto" variant="h3" as="h1">
          {title}
        </Title>
        <ProjectFilterDropdownPositioner>
          <>
            <DateFilterDropdown
              title={formatMessage(messages.filterDropdownTitle)}
              onChange={setProjectIds}
              textColor={theme.colors.tenantText}
              filterSelectorStyle="button"
              listTop="44px"
              mobileLeft={isMobileOrSmaller && !theme.isRtl ? '-70px' : 'auto'}
              eventsTime={eventsTime}
            />
          </>
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
        </ProjectFilterDropdownPositioner>
      </Container>
    );
  }
);

export default TopBar;
