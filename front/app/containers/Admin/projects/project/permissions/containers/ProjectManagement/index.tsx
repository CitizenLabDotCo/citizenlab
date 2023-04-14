import React from 'react';
import styled from 'styled-components';

// components
import { Section } from 'components/admin/Section';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';

// components
import {
  IconTooltip,
  Title,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import ModeratorList from '../../components/ModeratorList';
import UserSearch from '../../components/UserSearch';
import SeatInfo from 'components/SeatInfo';

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

const ProjectManagement = ({
  projectId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
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
      <SeatInfo seatType="project_manager" />
    </ModeratorSubSection>
  );
};

export default injectIntl(ProjectManagement);
