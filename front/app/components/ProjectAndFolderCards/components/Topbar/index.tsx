import React from 'react';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import Tabs from './Tabs';
import { ScreenReaderOnly } from 'utils/a11y';
import SelectAreas from './SelectAreas';

// styling
import styled from 'styled-components';
import { media, isRtl, fontSizes } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../../messages';

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

  ${media.smallerThanMinTablet`
    flex-direction: row;
  `}
`;

const DesktopFilters = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  height: 60px;
  display: flex;
  align-items: center;

  ${isRtl`
    justify-content: flex-start;
  `}
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
  onChangeAreas,
  onChangeTab,
}: Props) => {
  const appConfiguration = useAppConfiguration();
  const smallerThanMinTablet = useBreakpoint('smallTablet');

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
  const showFilters = smallerThanMinTablet
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
        {!smallerThanMinTablet && showFilters && (
          <DesktopFilters>
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

      {smallerThanMinTablet && showFilters && (
        <MobileFilters>
          <SelectAreas onChangeAreas={onChangeAreas} />
        </MobileFilters>
      )}
    </div>
  );
};

export default Header;
