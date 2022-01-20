import React from 'react';

// routing
import { withRouter } from 'react-router';

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
import { IStatusCounts, PublicationTab } from 'services/adminPublications';

const Title = styled.h2`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: normal;
  padding: 0;
  width: 100%;
  text-align: center;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 30px;
  border-bottom: 1px solid #d1d1d1;

  ${media.smallerThanMinTablet`
    justify-content: center;
    border: none;
  `};

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const FiltersArea = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  ${media.smallerThanMinTablet`
    display: none;
  `};

  ${isRtl`
    justify-content: flex-start;
  `}
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  &.publicationstatus {
    margin-right: 30px;
  }

  ${media.smallerThanMinTablet`
    height: auto;
  `};
`;

interface Props {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  showTitle: boolean;
  onChangeAreas: (areas: string[]) => void;
  onChangeTab: (tab: PublicationTab) => void;
}

const Header = ({
  currentTab,
  statusCounts,
  showTitle,
  onChangeAreas,
  onChangeTab,
}: Props) => {
  const appConfiguration = useAppConfiguration();

  if (isNilOrError(appConfiguration)) return null;

  const customCurrentlyWorkingOn =
    appConfiguration.data.attributes.settings.core.currently_working_on_text;

  const currentlyWorkingOnText =
    customCurrentlyWorkingOn && !isEmpty(customCurrentlyWorkingOn) ? (
      <T value={customCurrentlyWorkingOn} />
    ) : (
      <FormattedMessage {...messages.currentlyWorkingOn} />
    );
  return (
    <>
      {showTitle ? (
        <Title>{currentlyWorkingOnText}</Title>
      ) : (
        <ScreenReaderOnly>{currentlyWorkingOnText}</ScreenReaderOnly>
      )}

      <Container>
        <Tabs
          currentTab={currentTab}
          statusCounts={statusCounts}
          onChangeTab={onChangeTab}
        />

        <FiltersArea>
          <FilterArea>
            <SelectAreas onChangeAreas={onChangeAreas} />
          </FilterArea>
        </FiltersArea>
      </Container>
    </>
  );
};

export default withRouter(Header);
