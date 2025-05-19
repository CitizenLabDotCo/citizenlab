import React from 'react';

import {
  IconTooltip,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import UserSearch from 'components/admin/ModeratorUserSearch';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import { Section } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

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

  return (
    <ModeratorSubSection>
      <Box display="flex" mb="16px">
        <Title my="0px" mr="4px" variant="h2" color="primary">
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
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
    </ModeratorSubSection>
  );
};

export default ProjectManagement;
