import React, { useMemo } from 'react';
import { Box } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';
import usePages from 'hooks/usePages';

// components
import VisibleNavbarItemList from './VisibleNavbarItemList';
// import HiddenNavbarItemList from './HiddenNavbarItemList';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import getItemsNotInNavbar from './getItemsNotInNavbar';

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
  const navbarItems = useNavbarItems();
  const pages = usePages();

  if (isNilOrError(navbarItems) || isNilOrError(pages)) return null;

  const itemsNotInNavBar = useMemo(() => {
    return getItemsNotInNavbar(navbarItems, pages);
  }, [navbarItems, pages]);

  return (
    <>
      <PageTitle>
        <FormattedMessage {...messages.pageTitle} />
      </PageTitle>

      <PageSubtitle>
        <FormattedMessage {...messages.pageSubtitle} />
      </PageSubtitle>

      <Box mb="44px">
        <VisibleNavbarItemList />
      </Box>

      {/* <HiddenNavbarItemList
        itemsNotInNavbar={itemsNotInNavBar}
        addButtonDisabled={navbarItems.length === 7}
        onClickAddButton={handleAddNavbarItem}
        onClickDeleteButton={createDeletePage(
          messages.deletePageConfirmationHidden
        )}
        onClickViewButton={viewPage}
      /> */}
    </>
  );
};

export default injectIntl(NavigationSettings);
