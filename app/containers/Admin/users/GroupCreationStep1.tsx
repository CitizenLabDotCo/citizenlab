// Libraries
import React, { memo } from 'react';

// Components
import { Icon } from 'cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken, transparentize } from 'polished';

const Container = styled.div`
  display: flex;
`;

export const GroupType = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 50px;
  padding-bottom: 50px;
  position: relative;
  flex: 1;
  background: ${colors.lightGreyishBlue};
`;

export const IconWrapper = styled.div`
  width: 62px;
  height: 62px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${transparentize(0.9, colors.adminTextColor)};
`;

const ManualGroupIcon = styled(Icon).attrs({ name: 'database' })`
  width: 28px;
  height: 28px;
  fill: ${colors.adminTextColor};
  fill: ${colors.adminTextColor};
`;

export const GroupName = styled.p`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  margin-top: 15px;
`;

export const GroupDescription = styled.div`
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

export const DescriptionText = styled.div`
  max-width: 285px;
  color: ${colors.adminTextColor};
  text-align: center;
`;

export const MoreInfoLink = styled.a`
  color: ${colors.clBlueDark};
  text-align: center;
  text-decoration: underline;
  margin-top: 10px;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

export const Step2Button = styled(Button)``;

// Typings
import { IGroupData } from 'services/groups';
import Outlet from 'components/Outlet';
import { MembershipType } from 'resources/GetGroups';

export interface Props {
  onOpenStep2: (groupType: IGroupData['attributes']['membership_type']) => void;
}

const GroupCreationStep1 = memo(
  ({ intl, onOpenStep2 }: Props & InjectedIntlProps) => {
    const formattedLink = intl.formatMessage(messages.readMoreLink);

    const createStep2Handler = (groupType: MembershipType) => () => {
      onOpenStep2(groupType);
    };

    return (
      <Container>
        <GroupType className="manual">
          <IconWrapper>
            <ManualGroupIcon />
          </IconWrapper>
          <GroupName>
            <FormattedMessage {...messages.step1TypeNameNormal} />
          </GroupName>
          <GroupDescription>
            <DescriptionText>
              <FormattedMessage {...messages.step1TypeDescriptionNormal} />
            </DescriptionText>
            <MoreInfoLink href={formattedLink} target="_blank">
              <FormattedMessage {...messages.step1LearnMoreGroups} />
            </MoreInfoLink>
          </GroupDescription>
          <Step2Button
            className="e2e-create-normal-group-button"
            buttonStyle="cl-blue"
            onClick={createStep2Handler('manual')}
          >
            <FormattedMessage {...messages.step1CreateButtonNormal} />
          </Step2Button>
        </GroupType>
        <Outlet
          id="app.containers.Admin.users.GroupCreationStep1.type"
          onClick={createStep2Handler}
          formattedLink={formattedLink}
        />
      </Container>
    );
  }
);

export default injectIntl<Props>(GroupCreationStep1);
