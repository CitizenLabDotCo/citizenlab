import React, { memo } from 'react';
import useTenant from 'hooks/useTenant';
import { get } from 'lodash-es';
import Link from 'utils/cl-router/Link';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Title = styled.div`
  & h2 {
    font-size: ${fontSizes.base}px;
    font-weight: 600;
  }
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 7px;
`;

const Content = styled.div`
  color: ${colors.label};

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

const InitiativeInfoContent = memo(() => {
  const tenant = useTenant();

  return (
    <Content>
      <Title>
        <FormattedMessage tagName="h2" {...messages.explanationTitle} />
      </Title>
      <FormattedMessage
        {...messages.explanationContent}
        values={{
          constraints: (
            <Bold>
              <FormattedMessage
                {...messages.constraints}
                values={{
                  voteThreshold: get(tenant, 'attributes.settings.initiatives.voting_threshold'),
                  daysLimit: get(tenant, 'attributes.settings.initiatives.days_limit')
                }}
              />
            </Bold>
          ),
          link: <Link to="/pages/initiatives"><FormattedMessage {...messages.readMore} /></Link>
        }}
      />
    </Content>
  );
});

export default InitiativeInfoContent;
