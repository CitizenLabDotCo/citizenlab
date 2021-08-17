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
import messages from '../../messages';

const StyledPageList = styled(PageList)`
  margin-bottom: 44px;
`;

interface InputProps {}

interface DataProps {
  pages: GetPagesChildProps;
}

interface Props extends InputProps, DataProps {}

const Pages = ({ pages }: Props) => {
  if (!isNilOrError(pages)) {
    return (
      <>
        <UpgradeBox />

        <StyledPageList
          title={<FormattedMessage {...messages.navigationItems} />}
          pages={pages}
        />

        <PageList
          title={<FormattedMessage {...messages.hiddenFromNavigation} />}
          pages={pages}
        />
      </>
    );
  }

  return null;
};

export default (inputProps: InputProps) => (
  <GetPages>{(pages) => <Pages {...inputProps} pages={pages} />}</GetPages>
);
