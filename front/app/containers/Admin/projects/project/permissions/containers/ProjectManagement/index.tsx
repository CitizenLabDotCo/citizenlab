import React from 'react';
import styled from 'styled-components';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';

// components
import { IconTooltip, Box } from '@citizenlab/cl2-component-library';
import ModeratorList from '../../components/ModeratorList';
import UserSearch from '../../components/UserSearch';
import SeatInfo from 'components/SeatInfo';
import { Section, SubSectionTitle } from 'components/admin/Section';

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

const ProjectManagement = ({
  projectId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  return (
    <ModeratorSubSection>
      <SubSectionTitle>
        <FormattedMessage {...messages.moderatorsSectionTitle} />
        <IconTooltip
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
      </SubSectionTitle>
      <UserSearch projectId={projectId} />
      <ModeratorList projectId={projectId} />
      {!hasSeatBasedBillingEnabled && (
        <Box width="516px">
          <SeatInfo seatType="collaborator" />
        </Box>
      )}
    </ModeratorSubSection>
  );
};

export default injectIntl(ProjectManagement);
