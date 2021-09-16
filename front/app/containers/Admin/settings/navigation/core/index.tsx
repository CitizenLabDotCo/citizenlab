import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

// resources
import GetPages, { GetPagesChildProps } from 'resources/GetPages';

// components
import UpgradeBox from './UpgradeBox';
import PageList from 'components/admin/PageList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const StyledPageList = styled(PageList)`
  margin-bottom: 44px;
`;

interface InputProps {}

interface DataProps {
  pagesData: GetPagesChildProps;
}

interface Props extends InputProps, DataProps {}

const PagesOverview = ({ pagesData }: Props) => {
  if (!isNilOrError(pagesData)) {
    return (
      <>
        <UpgradeBox />

        <StyledPageList
          title={<FormattedMessage {...messages.navigationItems} />}
          pagesData={pagesData.slice(0, 8)}
          pagesPermissions={Array(pagesData.length)
            .fill(0)
            .map((_, i) => ({ isDefaultPage: i < 2 }))}
          lockFirstNItems={2}
        />

        <PageList
          title={<FormattedMessage {...messages.hiddenFromNavigation} />}
          pagesData={pagesData.slice(8, 16)}
          pagesPermissions={Array(pagesData.length)
            .fill(0)
            .map(() => ({ hasAddButton: true }))}
        />
      </>
    );
  }

  return null;
};

export default (inputProps: InputProps) => (
  <GetPages>
    {(pagesData) => <PagesOverview {...inputProps} pagesData={pagesData} />}
  </GetPages>
);
