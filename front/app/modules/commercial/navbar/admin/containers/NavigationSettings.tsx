import React from 'react';
import { Box } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import usePages from 'hooks/usePages';
import useNavbarItems from 'hooks/useNavbarItems';

// components
import VisibleNavbarItemList from '../components/NavbarItemList/VisibleNavbarItemList';
import HiddenNavbarItemList from '../components/NavbarItemList/HiddenNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import generateNavbarItems from './generateNavbarItems';

const PageTitle = styled.div`
  font-size: 25px;
  font-weight: 700;
  color: ${colors.adminTextColor};
  margin-bottom: 28px;
`;

const PageSubtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: ${colors.label};
  margin-bottom: 58px;
`;

const NavigationSettings = () => {
  const pages = usePages();
  const navbarItems = useNavbarItems();

  if (isNilOrError(pages) || isNilOrError(navbarItems)) return null;

  // temporary solution until backend is fixed
  const { visibleNavbarItems, hiddenNavbarItems } = generateNavbarItems(
    navbarItems,
    pages
  );

  return (
    <>
      <PageTitle>
        <FormattedMessage {...messages.pageTitle} />
      </PageTitle>

      <PageSubtitle>
        <FormattedMessage {...messages.pageSubtitle} />
      </PageSubtitle>

      <Box mb="44px">
        <VisibleNavbarItemList
          navbarItems={visibleNavbarItems}
          lockFirstNItems={2}
        />
      </Box>

      <HiddenNavbarItemList navbarItems={hiddenNavbarItems} />
    </>
  );
};

export default NavigationSettings;
