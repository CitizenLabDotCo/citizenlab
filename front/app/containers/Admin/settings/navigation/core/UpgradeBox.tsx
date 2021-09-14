import React from 'react';

// components
import Button from 'components/UI/Button';
import { Box, Icon } from 'cl2-component-library';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
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

const CustomizeYourNavigationBarText = styled.div`
  font-size: ${fontSizes.xxl}px;
  font-weight: 700;
  margin-bottom: 17px;
`;

const WithThePremiumPlanText = styled.p`
  color: ${colors.adminTextColor};
  margin-bottom: 35px;
  max-width: 559px;
  font-size: ${fontSizes.base}px;
`;

const ContactUsButton = styled(Button)`
  margin-bottom: 25px;
`;

const ComparePlansLink = styled.a`
  font-size: ${fontSizes.base}px;
  color: #596b7a;
`;

export default () => (
  <Box
    padding="28px 78px 37px 50px"
    border="1px solid #E0E0E0"
    borderRadius="3px"
    marginBottom="50px"
    display="flex"
    flexDirection="row"
    justifyContent="space-between"
  >
    <Box display="flex" flexDirection="column" alignItems="flex-start">
      <UpgradeToPremiumText>
        <StyledIcon name="circled-star" />
        <FormattedMessage {...messages.upgradeToPremium} />
      </UpgradeToPremiumText>

      <CustomizeYourNavigationBarText>
        <FormattedMessage {...messages.customizeYourNavigationBar} />
      </CustomizeYourNavigationBarText>

      <WithThePremiumPlanText>
        <FormattedMessage {...messages.withThePremiumPlan} />
      </WithThePremiumPlanText>
    </Box>

    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <ContactUsButton
        bgColor={colors.adminTextColor}
        text={<FormattedMessage {...messages.contactUs} />}
      />

      <ComparePlansLink href="https://www.citizenlab.co/plans" target="_blank">
        <FormattedMessage {...messages.comparePlans} />
      </ComparePlansLink>
    </Box>
  </Box>
);