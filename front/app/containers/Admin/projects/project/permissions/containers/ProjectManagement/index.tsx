import React from 'react';
import styled from 'styled-components';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import { IconTooltip, Box, Title } from '@citizenlab/cl2-component-library';
import ModeratorList from '../../components/ModeratorList';
import UserSearch from '../../components/UserSearch';
import SeatInfo from 'components/SeatInfo';
import { Section } from 'components/admin/Section';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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
      <UserSearch projectId={projectId} />
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
