import React from 'react';

// styling
import styled from 'styled-components';
import { Box } from 'cl2-component-library';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

const UpgradeToPremiumText = styled.div`
  color: ${colors.label};
  text-transform: uppercase;
  font-weight: bold;
  font-size: ${fontSizes.xs}px;
  margin-bottom: 15px;
`;

const UpgradeToCustomizeText = styled.div`
  font-size: ${fontSizes.xxl}px;
  font-weight: 700;
`;

export default () => (
  <Box
    background="#F2F3F4"
    padding="28px 50px"
    border="1px solid #E0E0E0"
    borderRadius="3px"
    marginBottom="50x"
  >
    <UpgradeToPremiumText>
      <FormattedMessage {...messages.upgradeToPremium} />
    </UpgradeToPremiumText>

    <UpgradeToCustomizeText>
      <FormattedMessage {...messages.upgradeToCustomize} />
    </UpgradeToCustomizeText>
  </Box>
);
