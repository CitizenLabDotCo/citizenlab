import React from 'react';

// components
import Button from 'components/UI/Button';
import { Box, Icon } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

const UpgradeToPremiumText = styled.div`
  color: ${colors.label};
  text-transform: uppercase;
  font-weight: bold;
  font-style: normal;
  font-size: ${fontSizes.xs}px;
  line-height: 14px;
  margin-bottom: 15px;
`;

const StyledIcon = styled(Icon)`
  width: ${fontSizes.base}px;
  margin-right: 6px;
  transform: translateY(-1.5px);
`;

const UpgradeToCustomizeText = styled.div`
  font-size: ${fontSizes.xxl}px;
  font-weight: 700;
  margin-bottom: 17px;
`;

const DefineThePagesText = styled.p`
  color: ${colors.adminTextColor};
  margin-bottom: 35px;
  max-width: 559px;
`;

const ContactASpecialistButton = styled(Button)`
  margin-right: 27px;
`;

const ComparePlansLink = styled.a`
  font-size: ${fontSizes.base};
  color: #596b7a;
  line-height: 37px;
`;

export default () => (
  <Box
    background="#F2F3F4"
    padding="28px 50px"
    border="1px solid #E0E0E0"
    borderRadius="3px"
    marginBottom="50x"
    display="flex"
    flexDirection="column"
    alignItems="flex-start"
  >
    <UpgradeToPremiumText>
      <StyledIcon name="circled-star" />
      <FormattedMessage {...messages.upgradeToPremium} />
    </UpgradeToPremiumText>

    <UpgradeToCustomizeText>
      <FormattedMessage {...messages.upgradeToCustomize} />
    </UpgradeToCustomizeText>

    <DefineThePagesText>
      <FormattedMessage {...messages.defineThePages} />
    </DefineThePagesText>

    <Box display="flex" flexDirection="row" alignItems="flex-start">
      <ContactASpecialistButton
        bgColor={colors.adminTextColor}
        width="184px"
        height="37px"
        text={<FormattedMessage {...messages.contactASpecialist} />}
      />

      <ComparePlansLink href="https://www.citizenlab.co/plans" target="_blank">
        Compare plans
      </ComparePlansLink>
    </Box>
  </Box>
);
