import React from 'react';

import {
  IconTooltip,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import { Section } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ModeratorList from '../../components/ModeratorList';
import UserSearch from '../../components/UserSearch';

import messages from './messages';

const ModeratorSubSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  projectId: string;
}

const ProjectManagement = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  return (
    <ModeratorSubSection>
      <Box display="flex" mb="16px">
        <Title my="0px" mr="4px" styleVariant="h2" color="primary">
          <FormattedMessage {...messages.projectManagementTitle} />
        </Title>
        <IconTooltip
          mt="4px"
          content={
            <FormattedMessage
              {...messages.projectManagerTooltipContent}
              values={{
                moderationInfoCenterLink: (
                  <StyledA
                    href={formatMessage(messages.moreInfoModeratorLink)}
                    target="_blank"
                  >
                    <FormattedMessage
                      {...messages.moderationInfoCenterLinkText}
                    />
                  </StyledA>
                ),
              }}
            />
          }
        />
      </Box>
      <UserSearch
        projectId={projectId}
        label={
          <Text
            color="primary"
            p="0px"
            mb="0px"
            style={{ fontWeight: '500', fontSize: '18px' }}
          >
            {formatMessage(messages.moderatorSearchFieldLabel)}
          </Text>
        }
      />
      <ModeratorList projectId={projectId} />
      {!hasSeatBasedBillingEnabled && (
        <Box width="516px">
          <SeatInfo seatType="moderator" />
        </Box>
      )}
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
