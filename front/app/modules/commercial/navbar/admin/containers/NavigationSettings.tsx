import React from 'react';
import { Box } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// hooks
import useNavbarItems from 'hooks/useNavbarItems';

// components
import VisibleNavbarItemList from '../components/NavbarItemList/VisibleNavbarItemList';
import HiddenNavbarItemList from '../components/NavbarItemList/HiddenNavbarItemList';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

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
  const visibleNavbarItems = useNavbarItems({ visible: true });
  const hiddenNavbarItems = useNavbarItems({ visible: false });

  return (
    <>
      <PageTitle>
        <FormattedMessage {...messages.pageTitle} />
      </PageTitle>

      <PageSubtitle>
        <FormattedMessage {...messages.pageSubtitle} />
      </PageSubtitle>

      <Box mb="44px">
        {!isNilOrError(visibleNavbarItems) && (
          <VisibleNavbarItemList
            navbarItems={visibleNavbarItems}
            lockFirstNItems={2}
          />
        )}
      </Box>

      {!isNilOrError(hiddenNavbarItems) && (
        <HiddenNavbarItemList navbarItems={hiddenNavbarItems} />
      )}
    </>
  );
};

export default NavigationSettings;
