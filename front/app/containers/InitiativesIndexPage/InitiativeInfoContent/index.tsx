import React, { memo } from 'react';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import useLocalize from 'hooks/useLocalize';

const Content = styled.div`
  color: ${colors.textSecondary};
  text-align: center;
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.xl}px;

  a {
    text-decoration: underline;
    color: inherit;

    &:hover {
      color: #000;
    }
  }
`;

const Bold = styled.span`
  font-weight: 600;
`;

interface Props {
  className?: string;
}

const InitiativeInfoContent = memo<Props>(({ className }) => {
  const { data: appConfig } = useAppConfiguration();
  const localize = useLocalize();

  if (!isNilOrError(appConfig)) {
    const reactionThreshold =
      appConfig.data.attributes.settings.initiatives.reacting_threshold;
    const daysLimit = appConfig.data.attributes.settings.initiatives.days_limit;

    return (
      <Content className={className}>
        <FormattedMessage
          {...messages.explanationContent}
          values={{
            constraints: (
              <Bold>
                <FormattedMessage
                  {...messages.constraints}
                  values={{
                    voteThreshold: reactionThreshold,
                    daysLimit,
                  }}
                />
              </Bold>
            ),
            link: (
              <Link to="/pages/initiatives">
                <FormattedMessage {...messages.learnMoreAboutProposals} />
              </Link>
            ),
            orgName: localize(
              appConfig.data.attributes.settings.core.organization_name
            ),
          }}
        />
      </Content>
    );
  }

  return null;
});

export default InitiativeInfoContent;
