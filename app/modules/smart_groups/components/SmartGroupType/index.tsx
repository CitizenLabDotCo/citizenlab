import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { FC } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';
import { transparentize } from 'polished';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';

import messages from './messages';
import adminUsersMessages from 'containers/Admin/users/messages';

import {
  MoreInfoLink,
  DescriptionText,
  GroupType as BaseGroupType,
  IconWrapper as BaseIconWrapper,
  GroupDescription,
  Step2Button,
  GroupName,
} from 'containers/Admin/users/GroupCreationStep1';

import { MembershipType } from 'services/groups';

const GroupType = styled(BaseGroupType)`
  background: ${colors.background};
`;

const IconWrapper = styled(BaseIconWrapper)`
  background: ${transparentize(0.9, colors.adminOrangeIcons)};
`;

const LightningBoltIcon = styled(Icon).attrs({ name: 'lightningBolt' })`
  width: 28px;
  height: 28px;
  fill: ${colors.adminOrangeIcons};
`;

const BlackedOut = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
`;

const Copy = styled.p`
  display: flex;
  flex-direction: column;
`;

const LockIcon = styled(Icon)`
  width: 30px;
  height: 30px;
  margin-bottom: 30px;
`;

const LearnMoreLink = styled.a`
  color: white;
  text-decoration: underline;

  &:hover {
    color: inherit;
    cursor: pointer;
    text-decoration: underline;
  }
`;

export interface SmartGroupTypeProps {
  formattedLink: string;
  onClick: (type: MembershipType) => () => any;
}

const SmartGroupType: FC<SmartGroupTypeProps> = ({
  formattedLink,
  onClick,
}) => {
  const isSmartGroupsEnabled = useFeatureFlag('smart_groups');

  return (
    <GroupType className="rules">
      <IconWrapper>
        <LightningBoltIcon />
      </IconWrapper>
      <GroupName>
        <FormattedMessage {...adminUsersMessages.step1TypeNameSmart} />
      </GroupName>
      <GroupDescription>
        <DescriptionText>
          <FormattedMessage {...adminUsersMessages.step1TypeDescriptionSmart} />
        </DescriptionText>
        <MoreInfoLink href={formattedLink} target="_blank">
          <FormattedMessage {...adminUsersMessages.step1LearnMoreGroups} />
        </MoreInfoLink>
      </GroupDescription>
      <Step2Button
        disabled={!isSmartGroupsEnabled}
        className="e2e-create-rules-group-button"
        buttonStyle="cl-blue"
        onClick={onClick('rules')}
      >
        <FormattedMessage {...adminUsersMessages.step1CreateButtonSmart} />
      </Step2Button>
      {!isSmartGroupsEnabled && (
        <BlackedOut>
          <LockIcon name="lock" />
          <Copy>
            <FormattedMessage {...messages.smartGroupsAvailability} />
          </Copy>
          <LearnMoreLink href="https://www.citizenlab.co/plans" target="_blank">
            <FormattedMessage {...messages.learnMorePlans} />
          </LearnMoreLink>
        </BlackedOut>
      )}
    </GroupType>
  );
};

export default SmartGroupType;
