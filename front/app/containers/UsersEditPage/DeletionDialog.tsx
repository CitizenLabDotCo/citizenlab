import React from 'react';

import { fontSizes } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import FormattedAnchor from 'components/FormattedAnchor';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div`
  padding: 0px 10px;
  line-height: 25px;
  font-size: ${fontSizes.base}px;
`;

const Logo = styled.img`
  max-width: 100%;
  max-height: 44px;
  margin: 0;
  padding: 0px;
  cursor: pointer;
`;

const Styledh1 = styled.h1`
  font-size: ${fontSizes.xxl}px;
  font-weight: 500;
  margin-top: 20px;
  margin-bottom: 0;
  line-height: 33px;
`;

const Styledh2 = styled.h2`
  font-size: ${fontSizes.l}px;
  font-weight: 500;
  line-height: 24px;
`;

const ButtonsContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 20px;
  display: flex;
`;

interface Props {
  closeDialog: () => void;
}

const DeletionDialog = ({
  closeDialog,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();

  const deleteProfile = () => {
    eventEmitter.emit('deleteProfileAndShowSuccessModal');
    clHistory.push('/');
    closeDialog();
  };

  if (!isNilOrError(appConfiguration)) {
    const logo = appConfiguration.data.attributes.logo?.medium;
    // just the org's name works fine as alt text for a11y purposes
    const localizedOrgName = localize(
      appConfiguration.data.attributes.settings.core.organization_name
    );
    return (
      <Container>
        {logo && <Logo src={logo} alt={localizedOrgName} />}
        <Styledh1>
          <FormattedMessage {...messages.deleteYourAccount} />
        </Styledh1>
        <p>
          <FormattedMessage {...messages.deleteAccountSubtext} />
        </p>
        <Styledh2>
          <FormattedMessage {...messages.reasonsToStayListTitle} />
        </Styledh2>
        <ul>
          <li>
            <FormattedMessage {...messages.activeProposalVotesWillBeDeleted} />
          </li>
          <li>
            <FormattedMessage {...messages.tooManyEmails} />
          </li>
          <li>
            <FormattedMessage
              {...messages.privacyReasons}
              values={{
                conditionsLink: (
                  <Link to="/pages/terms-and-conditions" target="_blank">
                    <FormattedMessage {...messages.conditionsLinkText} />
                  </Link>
                ),
              }}
            />
          </li>
          <li>
            <FormattedAnchor
              mainMessage={messages.contactUs}
              mainMessageLinkKey="feedbackLink"
              href={formatMessage(messages.feedbackLinkUrl, {
                url: location.href,
              })}
              linkTextMessage={messages.feedbackLinkText}
            />
          </li>
          <li>
            <FormattedMessage {...messages.noGoingBack} />
          </li>
        </ul>
        <ButtonsContainer>
          <Button
            buttonStyle="delete"
            id="deletion"
            onClick={deleteProfile}
            width="auto"
            justifyWrapper="left"
            data-cy="e2e-delete-profile-confirmation"
          >
            <FormattedMessage {...messages.deleteMyAccount} />
          </Button>
          <Button
            buttonStyle="text"
            onClick={closeDialog}
            width="auto"
            justifyWrapper="left"
          >
            <FormattedMessage {...messages.cancel} />
          </Button>
        </ButtonsContainer>
      </Container>
    );
  }

  return null;
};

export default injectIntl(DeletionDialog);
