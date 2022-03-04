import React from 'react';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import Tabs from './Tabs';
import { ScreenReaderOnly } from 'utils/a11y';
import SelectTopics from './SelectTopics';
import SelectAreas from './SelectAreas';

// styling
import styled from 'styled-components';
import { media, isRtl, fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../..';

const Title = styled.h2<{ hasPublications: boolean }>`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  width: 100%;
  text-align: center;
  margin-bottom: 26px;

  ${media.smallerThanMinTablet`
    text-align: left;
    margin-bottom: ${({ hasPublications }) =>
      hasPublications ? '36' : '22'}px;
    margin-left: 4px;
  `}
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  border-bottom: 1px solid #d1d1d1;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.xlPhone`
    flex-direction: row;
  `}
`;

const DesktopFilters = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  display: flex;
  align-items: center;

  ${isRtl`
    justify-content: flex-start;
  `}
`;

const FilterLabel = styled.div`
  margin-right: 18px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
`;

const MobileFilters = styled.div`
  display: block;
  margin-top: 21px;
`;

interface Props {
  className?: string;
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  availableTabs: PublicationTab[];
  showTitle: boolean;
  hasPublications: boolean;
  onChangeTopics: (topics: string[]) => void;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
}

const Header = ({
  className,
  currentTab,
  statusCounts,
  availableTabs,
  showTitle,
  hasPublications,
  onChangeTopics,
  onChangeAreas,
  onChangeTab,
}: Props) => {
  const appConfiguration = useAppConfiguration();
  const smallerThanXlPhone = useBreakpoint('xlPhone');

  if (isNilOrError(appConfiguration)) return null;

  const customCurrentlyWorkingOn =
    appConfiguration.data.attributes.settings.core.currently_working_on_text;

  const currentlyWorkingOnText =
    customCurrentlyWorkingOn && !isEmpty(customCurrentlyWorkingOn) ? (
      <T value={customCurrentlyWorkingOn} />
    ) : (
      <FormattedMessage {...messages.currentlyWorkingOn} />
    );

  const showTabs = statusCounts.all > 0;
  const showFilters = smallerThanXlPhone
    ? hasPublications
    : statusCounts.all > 0;

  return (
    <div className={className}>
      {showTitle ? (
        <Title
          hasPublications={hasPublications}
          data-testid="currently-working-on-text"
        >
          {currentlyWorkingOnText}
        </Title>
      ) : (
        <ScreenReaderOnly>{currentlyWorkingOnText}</ScreenReaderOnly>
      )}

      <Container>
        {!smallerThanXlPhone && showFilters && (
          <DesktopFilters>
            <FilterLabel>
              <FormattedMessage {...messages.filterBy} />
            </FilterLabel>
            <SelectTopics onChangeTopics={onChangeTopics} />
            <SelectAreas onChangeAreas={onChangeAreas} />
          </DesktopFilters>
        )}

        {showTabs && (
          <Tabs
            currentTab={currentTab}
            statusCounts={statusCounts}
            availableTabs={availableTabs}
            onChangeTab={onChangeTab}
          />
        )}
      </Container>

      {smallerThanXlPhone && showFilters && (
        <MobileFilters>
          <SelectTopics onChangeTopics={onChangeTopics} />
          <SelectAreas onChangeAreas={onChangeAreas} />
        </MobileFilters>
      )}
    </div>
  );
};

export default Header;
