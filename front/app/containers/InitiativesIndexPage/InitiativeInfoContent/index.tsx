import React, { memo } from 'react';
import useAppConfiguration from 'hooks/useAppConfiguration';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from '../messages';

const Content = styled.div`
  color: ${colors.label};
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

const InitiativeInfoContent = memo<InjectedLocalized & Props>(
  ({ className, localize }) => {
    const tenant = useAppConfiguration();

    if (!isNilOrError(tenant)) {
      const voteThreshold =
        tenant.data.attributes.settings.initiatives?.voting_threshold;
      const daysLimit = tenant.data.attributes.settings.initiatives?.days_limit;

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
                      voteThreshold,
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
                tenant.data.attributes.settings.core.organization_name
              ),
            }}
          />
        </Content>
      );
    }

    return null;
  }
);

export default injectLocalize(InitiativeInfoContent);
