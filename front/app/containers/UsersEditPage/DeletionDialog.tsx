import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import FormattedAnchor from 'components/FormattedAnchor';
import Link from 'utils/cl-router/Link';
import clHistory from 'utils/cl-router/history';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import eventEmitter from 'utils/eventEmitter';
import useLocalize from 'hooks/useLocalize';
import { WrappedComponentProps } from 'react-intl';

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
  const appConfiguration = useAppConfiguration();
  const localize = useLocalize();

  const deleteProfile = () => {
    eventEmitter.emit('deleteProfileAndShowSuccessModal');
    clHistory.push('/');
    closeDialog();
  };

  if (!isNilOrError(appConfiguration)) {
    const logo = appConfiguration.attributes.logo?.medium;
    // just the org's name works fine as alt text for a11y purposes
    const localizedOrgName = localize(
      appConfiguration.attributes.settings.core.organization_name
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
            className="e2e-delete-profile-confirm"
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
