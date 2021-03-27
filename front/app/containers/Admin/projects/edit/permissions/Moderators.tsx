import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { GetModeratorsChildProps } from 'resources/GetModerators';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip } from 'cl2-component-library';
import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps {
  moderators: GetModeratorsChildProps;
}

const Container = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

class Moderators extends PureComponent<Props & InjectedIntlProps> {
  render() {
    const { moderators, projectId } = this.props;

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
                      href={this.props.intl.formatMessage(
                        messages.moreInfoModeratorLink
                      )}
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
}

const ModeratorsWithIntl = injectIntl(Moderators);

export default ModeratorsWithIntl;
