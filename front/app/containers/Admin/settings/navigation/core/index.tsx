import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// hooks
import usePages from 'hooks/usePages';

// components
import UpgradeBox from './UpgradeBox';
import PageList from 'components/admin/PageList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledPageList = styled(PageList)`
  margin-bottom: 44px;
`;

const PagesOverview = () => {
  const pages = usePages();

  if (!isNilOrError(pages)) {
    return (
      <>
        <UpgradeBox />

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
  }

  return null;
};

export default PagesOverview;
