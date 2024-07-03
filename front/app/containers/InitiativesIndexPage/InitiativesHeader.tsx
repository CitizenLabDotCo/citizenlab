import React from 'react';

import { media, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import AvatarBubbles from 'components/AvatarBubbles';
import InitiativeButton from 'components/InitiativeButton';
import T from 'components/T';
import Warning from 'components/UI/Warning';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import InitiativeInfoContent from './InitiativeInfoContent';
import messages from './messages';

const Container = styled.div`
  width: 100%;
  min-height: 350px;
  padding: 20px 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  ${media.phone`
    min-height: 300px;
  `}
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  max-width: ${(props) => props.theme.maxPageWidth + 60}px;
  padding-top: 50px;
  padding-left: 30px;
  padding-right: 30px;
  padding-bottom: 50px;
  ${media.phone`
    padding-bottom: 20px;
  `}
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${({ theme }) =>
    theme.signedOutHeaderTitleFontSize || fontSizes.xxxxl}px;
  font-weight: ${({ theme }) => theme.signedOutHeaderTitleFontWeight || 600};
  line-height: normal;
  text-align: center;
  width: 100%;
  max-width: 600px;
  margin: 0;
  padding: 0;
  margin-bottom: 18px;

  ${media.tablet`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${media.phone`
    font-size: ${fontSizes.xxl}px;
  `}
`;

const StyledAvatarBubbles = styled(AvatarBubbles)`
  min-height: 40px;
  margin-bottom: 18px;
`;

const StyledInitiativeInfoContent = styled(InitiativeInfoContent)`
  max-width: 550px;
  margin-bottom: 30px;
`;

export interface Props {
  className?: string;
}

const InitiativesHeader = ({ className }: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const postingPermission = useInitiativesPermissions('posting_initiative');
  const { formatMessage } = useIntl();
  if (isNilOrError(appConfiguration) || isNilOrError(postingPermission)) {
    return null;
  }

  const { enabled } = postingPermission;
  const proposalSubmissionEnabled = enabled === true || enabled === 'maybe';

  return (
    <Container className={`e2e-initiatives-header ${className || ''}`}>
      <ScreenReaderOnly>
        <FormattedMessage
          tagName="h1"
          {...messages.invisibleInitiativesPageTitle}
        />
      </ScreenReaderOnly>
      <Content>
        <Title style={{ hyphens: 'auto' }}>
          {proposalSubmissionEnabled ? (
            <FormattedMessage
              {...messages.header}
              values={{
                styledOrgName: (
                  <T
                    value={
                      appConfiguration.data.attributes.settings.core
                        .organization_name
                    }
                  />
                ),
              }}
            />
          ) : (
            <FormattedMessage
              {...messages.headerPostingProposalDisabled}
              values={{
                styledOrgName: (
                  <T
                    value={
                      appConfiguration.data.attributes.settings.core
                        .organization_name
                    }
                  />
                ),
              }}
            />
          )}
        </Title>
        <StyledAvatarBubbles />
        <StyledInitiativeInfoContent />
        {proposalSubmissionEnabled ? (
          <InitiativeButton location="initiatives_header" />
        ) : (
          <Warning>
            <FormattedMessage
              {...messages.newProposalsNotPermitted}
              values={{
                link: (
                  <Link to="/pages/faq" target="_blank">
                    {formatMessage(messages.guidelinesLinkText)}
                  </Link>
                ),
              }}
            />
          </Warning>
        )}
      </Content>
    </Container>
  );
};

export default InitiativesHeader;
