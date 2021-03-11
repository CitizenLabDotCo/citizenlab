import React from 'react';
import styled from 'styled-components';

// components
import { Section, SubSectionTitle } from 'components/admin/Section';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { IconTooltip } from 'cl2-component-library';
import ModeratorList from '../components/ModeratorList';
import UserSearch from '../components/UserSearch';

const ModeratorSubSection = styled(Section)`
  margin-bottom: 25px;
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
}: Props & InjectedIntlProps) => {
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
    </ModeratorSubSection>
  );
};

export default injectIntl(ProjectManagement);
