import React, { memo } from 'react';
import styled from 'styled-components';
import useModerators from '../../hooks/useModerators';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip } from 'cl2-component-library';
import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';

const Container = styled.div`
  width: 100%;
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

const Moderators = memo(
  ({ projectId, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const moderators = useModerators(projectId);

    return (
      <Container>
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
        <UserSearch projectId={projectId} moderators={moderators} />
        <ModeratorList moderators={moderators} projectId={projectId} />
      </Container>
    );
  }
);

export default injectIntl(Moderators);
