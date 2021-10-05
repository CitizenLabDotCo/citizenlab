import React from 'react';
import styled from 'styled-components';

// hooks
import usePages from 'hooks/usePages';
import useNavbarItems from 'hooks/useNavbarItems';

// components
import PageList from '../components/PageList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import generateNavbarItems from './generateNavbarItems';

const StyledPageList = styled(PageList)`
  margin-bottom: 44px;
`;

const PagesOverview = () => {
  const pages = usePages();
  const navbarItems = useNavbarItems();

  if (isNilOrError(pages) || isNilOrError(navbarItems)) return null;

  const { visibleNavbarItems, otherNavbarItems } = generateNavbarItems(
    navbarItems,
    pages
  );

  console.log(visibleNavbarItems);
  console.log(otherNavbarItems);

  return (
    <>
      <StyledPageList
        title={<FormattedMessage {...messages.navigationItems} />}
        pages={pages.slice(0, 8)}
        pagesPermissions={Array(pages.length)
          .fill(0)
          .map((_, i) => ({ isDefaultPage: i < 2 }))}
        sortable={true}
        lockFirstNItems={2}
      />

      <PageList
        title={<FormattedMessage {...messages.hiddenFromNavigation} />}
        pages={pages.slice(8, 16)}
        pagesPermissions={Array(pages.length)
          .fill(0)
          .map(() => ({ hasAddButton: true }))}
      />
    </>
  );
};

export default PagesOverview;
